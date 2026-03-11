package nl.tenmore.recipeserver.recipe.dto

import nl.tenmore.recipeserver.recipe.RecipePickState
import java.time.Instant

data class RecipeResponse(
    val id: Long,
    val name: String,
    val book: String?,
    val pageNumber: Int?,
    val createdByUsername: String,
    val createdAt: Instant,
    val pickState: RecipePickState,
    val calories: Int?
)
