package nl.tenmore.recipeserver.mealplan

import nl.tenmore.recipeserver.mealplan.dto.MealPlanResponse
import nl.tenmore.recipeserver.recipe.Recipe
import nl.tenmore.recipeserver.recipe.RecipePickState
import nl.tenmore.recipeserver.recipe.RecipeRepository
import nl.tenmore.recipeserver.recipe.dto.RecipeResponse
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.server.ResponseStatusException
import java.time.LocalDate
import java.time.format.DateTimeFormatter

@Service
class MealPlanService(private val mealPlanRepo: MealPlanRepository, private val recipeRepo: RecipeRepository) {

    @Transactional(readOnly = true)
    fun getMealPlanByDate(date: String): List<MealPlanResponse> {
        val parsed = LocalDate.parse("$date-1", DateTimeFormatter.ISO_WEEK_DATE)
        val endOfWeek = parsed.plusDays(6)
        return mealPlanRepo.findByPlannedDateBetween(parsed, endOfWeek).map { it.toResponse() }
    }

    @Transactional
    fun setMealPlanByDate(date: String, recipeId: Long?, createdByUsername: String): MealPlanResponse {
        val parsed = LocalDate.parse(date, DateTimeFormatter.ISO_DATE)

        val recipe = if (recipeId != null) {
            recipeRepo.findById(recipeId).orElseThrow {
                ResponseStatusException(HttpStatus.NOT_FOUND, "Recipe not found")
            }
        } else {
            var candidates = recipeRepo.findAllByPickStateIn(listOf(RecipePickState.NOT_PICKED))
            if (candidates.isEmpty()) {
                val toReset = recipeRepo.findAllByPickStateIn(listOf(RecipePickState.PICKED, RecipePickState.CURRENT))
                if (toReset.isEmpty()) throw ResponseStatusException(HttpStatus.CONFLICT, "No recipes available")
                toReset.forEach { it.pickState = RecipePickState.NOT_PICKED }
                recipeRepo.saveAll(toReset)
                candidates = toReset
            }
            candidates.random()
        }
        recipe.pickState = RecipePickState.CURRENT
        recipeRepo.save(recipe)

        val existing = mealPlanRepo.findByPlannedDate(parsed)
        val mealPlan = if (existing != null) {
            existing.recipe.pickState = RecipePickState.NOT_PICKED
            recipeRepo.save(existing.recipe)
            existing.recipe = recipe
            mealPlanRepo.save(existing)
        } else {
            mealPlanRepo.save(MealPlan(recipe = recipe, plannedDate = parsed, createdByUsername = createdByUsername))
        }

        return mealPlan.toResponse()
    }

    @Transactional
    fun clearWeek(week: String) {
        val monday = LocalDate.parse("$week-1", DateTimeFormatter.ISO_WEEK_DATE)
        val sunday = monday.plusDays(6)
        val entries = mealPlanRepo.findByPlannedDateBetween(monday, sunday)
        entries.forEach { it.recipe.pickState = RecipePickState.NOT_PICKED }
        recipeRepo.saveAll(entries.map { it.recipe })
        mealPlanRepo.deleteAll(entries)
    }

    @Transactional
    fun deleteMealPlan(date: String) {
        val parsed = LocalDate.parse(date, DateTimeFormatter.ISO_DATE)
        val mealPlan = mealPlanRepo.findByPlannedDate(parsed) ?: return
        mealPlan.recipe.pickState = RecipePickState.NOT_PICKED
        recipeRepo.save(mealPlan.recipe)
        mealPlanRepo.deleteByPlannedDate(parsed)
    }

    private fun MealPlan.toResponse() = MealPlanResponse(
        id = id,
        plannedDate = plannedDate,
        recipe = recipe.toResponse(),
        createdByUsername = createdByUsername
    )

    private fun Recipe.toResponse() = RecipeResponse(
        id = id,
        name = name,
        book = book,
        pageNumber = pageNumber,
        createdByUsername = createdByUsername,
        createdAt = createdAt,
        pickState = pickState,
        calories = calories,
    )
}