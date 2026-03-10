package nl.tenmore.recipeserver.bowl

import nl.tenmore.recipeserver.bowl.dto.BowlResponse
import nl.tenmore.recipeserver.recipe.RecipePickState
import nl.tenmore.recipeserver.recipe.RecipeRepository
import org.springframework.stereotype.Service

@Service
class BowlService(private val repo: RecipeRepository) {

    fun get(): BowlResponse {
        val recipes = repo.countAll()
        val recipesPicked = repo.countByPickState(RecipePickState.PICKED)
        val recipesLeft = recipes - recipesPicked
        return BowlResponse(
            recipesLeft = recipesLeft,
            recipesPicked = recipesPicked
        )
    }

}