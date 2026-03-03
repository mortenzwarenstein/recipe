package nl.tenmore.recipeserver.recipe.dto

import jakarta.validation.constraints.Min
import jakarta.validation.constraints.NotBlank

data class UpdateRecipeRequest(
    @field:NotBlank val name: String,
    @field:NotBlank val book: String,
    @field:Min(1) val pageNumber: Int
)
