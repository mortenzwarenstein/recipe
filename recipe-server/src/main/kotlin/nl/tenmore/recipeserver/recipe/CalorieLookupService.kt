package nl.tenmore.recipeserver.recipe

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import org.springframework.web.client.RestClient

@Service
class CalorieLookupService(
    @Value("\${calorie-lookup.spoonacular-api-key:}") private val spoonacularApiKey: String,
    @Value("\${calorie-lookup.anthropic-api-key:}") private val anthropicApiKey: String,
) {
    private val log = LoggerFactory.getLogger(javaClass)
    private val restClient = RestClient.create()
    private val objectMapper = ObjectMapper()

    fun lookupCalories(recipeName: String, bookName: String): Int? {
        if (spoonacularApiKey.isBlank() || anthropicApiKey.isBlank()) {
            log.debug("Calorie lookup skipped: API keys not configured")
            return null
        }
        return try {
            val englishName = translateToEnglish(recipeName, bookName) ?: return null
            log.debug("Translated '{}' to '{}'", recipeName, englishName)
            searchSpoonacular(englishName)
        } catch (e: Exception) {
            log.warn("Calorie lookup failed for '{}': {}", recipeName, e.message)
            null
        }
    }

    private fun translateToEnglish(recipeName: String, bookName: String): String? {
        val prompt = "I have a Dutch recipe called '$recipeName' from the cookbook '$bookName'. " +
            "Translate this recipe name to English for an online recipe search. " +
            "Respond with ONLY the English recipe name, nothing else."

        val body = mapOf(
            "model" to "claude-haiku-4-5-20251001",
            "max_tokens" to 50,
            "messages" to listOf(mapOf("role" to "user", "content" to prompt)),
        )

        val response = restClient.post()
            .uri("https://api.anthropic.com/v1/messages")
            .header("x-api-key", anthropicApiKey)
            .header("anthropic-version", "2023-06-01")
            .header("Content-Type", "application/json")
            .body(objectMapper.writeValueAsString(body))
            .retrieve()
            .body(String::class.java) ?: return null

        return objectMapper.readTree(response)
            .path("content")
            .elements()
            .asSequence()
            .firstOrNull { it.path("type").asText() == "text" }
            ?.path("text")?.asText()?.trim()
            ?.takeIf { it.isNotBlank() }
    }

    private fun searchSpoonacular(query: String): Int? {
        val response = restClient.get()
            .uri(
                "https://api.spoonacular.com/recipes/complexSearch?query={query}&number=1&addRecipeNutrition=true&apiKey={key}",
                query, spoonacularApiKey,
            )
            .retrieve()
            .body(String::class.java) ?: return null

        val results: JsonNode = objectMapper.readTree(response).path("results")
        if (results.isEmpty) return null

        return results.get(0)
            .path("nutrition")
            .path("nutrients")
            .elements()
            .asSequence()
            .firstOrNull { it.path("name").asText() == "Calories" }
            ?.path("amount")?.asDouble()?.toInt()
    }
}
