package nl.tenmore.recipeserver.bowl

import nl.tenmore.recipeserver.bowl.dto.BowlResponse
import nl.tenmore.recipeserver.recipe.RecipePickState
import nl.tenmore.recipeserver.recipe.RecipeService
import org.springframework.stereotype.Service

@Service
class BowlService(private val recipeService: RecipeService) {

    fun get(): BowlResponse {
        val recipes = recipeService.findAll()
        val recipesPicked = recipes.count { it.pickState == RecipePickState.PICKED }
        val recipesLeft = recipes.size - recipesPicked
        return BowlResponse(
            recipesLeft = recipesLeft,
            recipesPicked = recipesPicked
        )
    }

}