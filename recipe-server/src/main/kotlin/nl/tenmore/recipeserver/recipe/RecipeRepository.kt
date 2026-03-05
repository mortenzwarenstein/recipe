package nl.tenmore.recipeserver.recipe

import org.springframework.data.jpa.repository.JpaRepository

interface RecipeRepository : JpaRepository<Recipe, Long> {
    fun findAllByPickStateIn(recipePickStates: List<RecipePickState>): List<Recipe>
}