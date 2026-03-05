package nl.tenmore.recipeserver.recipe.dto

import jakarta.validation.constraints.Min
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size

data class UpdateRecipeRequest(
    @field:NotBlank @field:Size(max = 255) val name: String,
    @field:NotBlank @field:Size(max = 255) val book: String,
    @field:Min(1) val pageNumber: Int
)
