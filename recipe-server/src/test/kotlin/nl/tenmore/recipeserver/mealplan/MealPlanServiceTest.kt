package nl.tenmore.recipeserver.mealplan

import nl.tenmore.recipeserver.recipe.Recipe
import nl.tenmore.recipeserver.recipe.RecipePickState
import nl.tenmore.recipeserver.recipe.RecipeRepository
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.InjectMocks
import org.mockito.Mock
import org.mockito.junit.jupiter.MockitoExtension
import org.mockito.kotlin.any
import org.mockito.kotlin.never
import org.mockito.kotlin.verify
import org.mockito.kotlin.verifyNoInteractions
import org.mockito.kotlin.whenever
import org.springframework.web.server.ResponseStatusException
import java.time.LocalDate

@ExtendWith(MockitoExtension::class)
class MealPlanServiceTest {

    @Mock lateinit var mealPlanRepo: MealPlanRepository
    @Mock lateinit var recipeRepo: RecipeRepository

    @InjectMocks lateinit var service: MealPlanService

    private fun recipe(id: Long, pickState: RecipePickState = RecipePickState.NOT_PICKED) =
        Recipe(id = id, name = "Recipe $id", createdByUsername = "admin", pickState = pickState)

    private fun mealPlan(id: Long, recipe: Recipe, date: LocalDate) =
        MealPlan(id = id, recipe = recipe, plannedDate = date, createdByUsername = "admin")

    @Test
    fun `getMealPlanByDate returns entries for the week`() {
        val monday = LocalDate.of(2026, 3, 9)
        val entries = listOf(mealPlan(1, recipe(1), monday), mealPlan(2, recipe(2), monday.plusDays(1)))
        whenever(mealPlanRepo.findByPlannedDateBetween(monday, monday.plusDays(6))).thenReturn(entries)

        val result = service.getMealPlanByDate("2026-W11")

        assertThat(result).hasSize(2)
        assertThat(result[0].recipe.id).isEqualTo(1)
        assertThat(result[1].recipe.id).isEqualTo(2)
    }

    @Test
    fun `getMealPlanByDate returns empty list when no entries`() {
        val monday = LocalDate.of(2026, 3, 9)
        whenever(mealPlanRepo.findByPlannedDateBetween(monday, monday.plusDays(6))).thenReturn(emptyList())

        assertThat(service.getMealPlanByDate("2026-W11")).isEmpty()
    }

    @Test
    fun `setMealPlanByDate picks NOT_PICKED recipe and creates new entry`() {
        val recipe = recipe(1)
        val date = LocalDate.of(2026, 3, 11)
        whenever(recipeRepo.findAllByPickStateIn(listOf(RecipePickState.NOT_PICKED))).thenReturn(listOf(recipe))
        whenever(recipeRepo.save(recipe)).thenReturn(recipe)
        whenever(mealPlanRepo.findByPlannedDate(date)).thenReturn(null)
        whenever(mealPlanRepo.save(any())).thenReturn(mealPlan(1, recipe, date))

        val result = service.setMealPlanByDate("2026-03-11", null, "admin")

        assertThat(recipe.pickState).isEqualTo(RecipePickState.CURRENT)
        assertThat(result.recipe.id).isEqualTo(1)
    }

    @Test
    fun `setMealPlanByDate resets bowl and picks when no NOT_PICKED recipes`() {
        val pickedRecipe = recipe(1, RecipePickState.PICKED)
        val date = LocalDate.of(2026, 3, 11)
        whenever(recipeRepo.findAllByPickStateIn(listOf(RecipePickState.NOT_PICKED))).thenReturn(emptyList())
        whenever(recipeRepo.findAllByPickStateIn(listOf(RecipePickState.PICKED, RecipePickState.CURRENT)))
            .thenReturn(listOf(pickedRecipe))
        whenever(recipeRepo.saveAll(any<List<Recipe>>())).thenReturn(listOf(pickedRecipe))
        whenever(recipeRepo.save(pickedRecipe)).thenReturn(pickedRecipe)
        whenever(mealPlanRepo.findByPlannedDate(date)).thenReturn(null)
        whenever(mealPlanRepo.save(any())).thenReturn(mealPlan(1, pickedRecipe, date))

        service.setMealPlanByDate("2026-03-11", null, "admin")

        assertThat(pickedRecipe.pickState).isEqualTo(RecipePickState.CURRENT)
    }

    @Test
    fun `setMealPlanByDate throws CONFLICT when no recipes exist at all`() {
        whenever(recipeRepo.findAllByPickStateIn(listOf(RecipePickState.NOT_PICKED))).thenReturn(emptyList())
        whenever(recipeRepo.findAllByPickStateIn(listOf(RecipePickState.PICKED, RecipePickState.CURRENT)))
            .thenReturn(emptyList())

        assertThrows<ResponseStatusException> {
            service.setMealPlanByDate("2026-03-11", null, "admin")
        }
    }

    @Test
    fun `setMealPlanByDate replaces existing entry and resets old recipe`() {
        val oldRecipe = recipe(1, RecipePickState.CURRENT)
        val newRecipe = recipe(2)
        val date = LocalDate.of(2026, 3, 11)
        val existing = mealPlan(1, oldRecipe, date)
        whenever(recipeRepo.findAllByPickStateIn(listOf(RecipePickState.NOT_PICKED))).thenReturn(listOf(newRecipe))
        whenever(recipeRepo.save(any())).thenAnswer { it.arguments[0] as Recipe }
        whenever(mealPlanRepo.findByPlannedDate(date)).thenReturn(existing)
        whenever(mealPlanRepo.save(existing)).thenReturn(existing)

        service.setMealPlanByDate("2026-03-11", null, "admin")

        assertThat(oldRecipe.pickState).isEqualTo(RecipePickState.NOT_PICKED)
        assertThat(existing.recipe).isEqualTo(newRecipe)
    }

    @Test
    fun `setMealPlanByDate with recipeId picks that specific recipe`() {
        val specificRecipe = recipe(5, RecipePickState.PICKED)
        val date = LocalDate.of(2026, 3, 11)
        whenever(recipeRepo.findById(5L)).thenReturn(java.util.Optional.of(specificRecipe))
        whenever(recipeRepo.save(specificRecipe)).thenReturn(specificRecipe)
        whenever(mealPlanRepo.findByPlannedDate(date)).thenReturn(null)
        whenever(mealPlanRepo.save(any())).thenReturn(mealPlan(1, specificRecipe, date))

        val result = service.setMealPlanByDate("2026-03-11", 5L, "admin")

        assertThat(specificRecipe.pickState).isEqualTo(RecipePickState.CURRENT)
        assertThat(result.recipe.id).isEqualTo(5)
    }

    @Test
    fun `setMealPlanByDate with unknown recipeId throws 404`() {
        whenever(recipeRepo.findById(99L)).thenReturn(java.util.Optional.empty())

        assertThrows<ResponseStatusException> {
            service.setMealPlanByDate("2026-03-11", 99L, "admin")
        }
    }

    @Test
    fun `deleteMealPlan resets recipe to NOT_PICKED and removes entry`() {
        val recipe = recipe(1, RecipePickState.CURRENT)
        val date = LocalDate.of(2026, 3, 11)
        whenever(mealPlanRepo.findByPlannedDate(date)).thenReturn(mealPlan(1, recipe, date))

        service.deleteMealPlan("2026-03-11")

        assertThat(recipe.pickState).isEqualTo(RecipePickState.NOT_PICKED)
        verify(recipeRepo).save(recipe)
        verify(mealPlanRepo).deleteByPlannedDate(date)
    }

    @Test
    fun `deleteMealPlan does nothing when no entry exists`() {
        whenever(mealPlanRepo.findByPlannedDate(any())).thenReturn(null)

        service.deleteMealPlan("2026-03-11")

        verifyNoInteractions(recipeRepo)
        verify(mealPlanRepo, never()).deleteByPlannedDate(any())
    }

    @Test
    fun `clearWeek resets all recipes in week to NOT_PICKED and deletes entries`() {
        val r1 = recipe(1, RecipePickState.CURRENT)
        val r2 = recipe(2, RecipePickState.CURRENT)
        val monday = LocalDate.of(2026, 3, 9)
        val entries = listOf(mealPlan(1, r1, monday), mealPlan(2, r2, monday.plusDays(1)))
        whenever(mealPlanRepo.findByPlannedDateBetween(monday, monday.plusDays(6))).thenReturn(entries)
        whenever(recipeRepo.saveAll(any<List<Recipe>>())).thenReturn(entries.map { it.recipe })

        service.clearWeek("2026-W11")

        assertThat(r1.pickState).isEqualTo(RecipePickState.NOT_PICKED)
        assertThat(r2.pickState).isEqualTo(RecipePickState.NOT_PICKED)
        verify(mealPlanRepo).deleteAll(entries)
    }
}
