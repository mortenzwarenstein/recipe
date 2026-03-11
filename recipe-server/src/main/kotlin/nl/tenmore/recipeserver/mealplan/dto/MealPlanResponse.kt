package nl.tenmore.recipeserver.mealplan.dto

import nl.tenmore.recipeserver.recipe.dto.RecipeResponse
import java.time.LocalDate

data class MealPlanResponse(
    val id: Long,
    val plannedDate: LocalDate,
    val recipe: RecipeResponse,
    val createdByUsername: String
)
