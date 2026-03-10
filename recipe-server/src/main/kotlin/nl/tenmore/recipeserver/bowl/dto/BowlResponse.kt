package nl.tenmore.recipeserver.bowl.dto

data class BowlResponse(
    val recipesLeft: Long = 0,
    val recipesPicked: Long = 0
)
