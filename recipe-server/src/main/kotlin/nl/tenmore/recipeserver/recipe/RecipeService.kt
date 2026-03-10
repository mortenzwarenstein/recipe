package nl.tenmore.recipeserver.recipe

import nl.tenmore.recipeserver.recipe.dto.CreateRecipeRequest
import nl.tenmore.recipeserver.recipe.dto.PagedResponse
import nl.tenmore.recipeserver.recipe.dto.RecipeResponse
import nl.tenmore.recipeserver.recipe.dto.UpdateRecipeRequest
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Sort
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.server.ResponseStatusException

@Service
class RecipeService(private val recipeRepository: RecipeRepository) {

    @Transactional
    fun create(request: CreateRecipeRequest, username: String): RecipeResponse {
        val recipe = Recipe(
            name = request.name,
            book = request.book,
            pageNumber = request.pageNumber,
            createdByUsername = username
        )
        return recipeRepository.save(recipe).toResponse()
    }

    @Transactional(readOnly = true)
    fun findAll(page: Int, size: Int, q: String?): PagedResponse<RecipeResponse> {
        val pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"))
        val result = if (!q.isNullOrBlank()) {
            recipeRepository.findAllByNameContaining(q, pageable)
        } else {
            recipeRepository.findAll(pageable)
        }
        return PagedResponse(
            content = result.content.map { it.toResponse() },
            totalElements = result.totalElements,
            totalPages = result.totalPages,
            page = result.number,
            size = result.size,
        )
    }

    @Transactional(readOnly = true)
    fun findById(id: Long): RecipeResponse =
        recipeRepository.findById(id)
            .map { it.toResponse() }
            .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Recipe not found") }

    @Transactional
    fun update(id: Long, request: UpdateRecipeRequest): RecipeResponse {
        val recipe = recipeRepository.findById(id)
            .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Recipe not found") }

        recipe.name = request.name
        recipe.book = request.book
        recipe.pageNumber = request.pageNumber

        return recipeRepository.save(recipe).toResponse()
    }

    @Transactional
    fun getCurrent(): RecipeResponse? =
        recipeRepository.findAllByPickStateIn(listOf(RecipePickState.CURRENT)).firstOrNull()?.toResponse() ?: pick()


    @Transactional
    fun pick(currentIsPicked: Boolean = false): RecipeResponse? {
        val recipes = recipeRepository.findAll()
        if (recipes.isEmpty()) {
            throw ResponseStatusException(HttpStatus.NOT_FOUND, "No recipes available")
        }

        val currentRecipe = recipes.find { it.pickState == RecipePickState.CURRENT }
        if (currentRecipe != null) {
            currentRecipe.pickState = if (currentIsPicked) RecipePickState.PICKED else RecipePickState.NOT_PICKED
            recipeRepository.save(currentRecipe)
            recipeRepository.flush()
        }

        var candidates = recipes.filter { it.pickState == RecipePickState.NOT_PICKED && it != currentRecipe }
        if (candidates.isEmpty()) {
            val toReset = recipes.filter { it != currentRecipe }
            toReset.forEach { it.pickState = RecipePickState.NOT_PICKED }
            recipeRepository.saveAll(toReset)
            candidates = toReset
        }

        val next = candidates.randomOrNull() ?: return null
        next.pickState = RecipePickState.CURRENT
        return recipeRepository.save(next).toResponse()
    }

    @Transactional
    fun delete(id: Long, username: String, isAdmin: Boolean = false) {
        val recipe = recipeRepository.findById(id)
            .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Recipe not found") }

        if (!isAdmin && recipe.createdByUsername != username) {
            throw ResponseStatusException(HttpStatus.FORBIDDEN, "You can only delete your own recipes")
        }

        recipeRepository.delete(recipe)
    }

    @Transactional(readOnly = true)
    fun getBooks(q: String?): List<String> {
        val pageable = PageRequest.of(0, 10)
        return if (q != null) recipeRepository.fetchDistinctBooksByBook(q, pageable)
        else recipeRepository.fetchDistinctBooks(pageable)
    }

    @Transactional(readOnly = true)
    fun getPickedRecipesCount(): Long {
        return recipeRepository.countByPickState(RecipePickState.PICKED)
    }


    private fun Recipe.toResponse() = RecipeResponse(
        id = id,
        name = name,
        book = book,
        pageNumber = pageNumber,
        createdByUsername = createdByUsername,
        createdAt = createdAt,
        pickState = pickState
    )
}
