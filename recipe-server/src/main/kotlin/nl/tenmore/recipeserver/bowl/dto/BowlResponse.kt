package nl.tenmore.recipeserver.bowl.dto

data class BowlResponse(
    val recipesLeft: Int = 0,
    val recipesPicked: Int = 0
)
