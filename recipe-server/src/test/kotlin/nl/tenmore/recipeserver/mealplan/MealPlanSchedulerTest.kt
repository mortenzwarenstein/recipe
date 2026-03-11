package nl.tenmore.recipeserver.mealplan

import nl.tenmore.recipeserver.recipe.Recipe
import nl.tenmore.recipeserver.recipe.RecipePickState
import nl.tenmore.recipeserver.recipe.RecipeRepository
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.InjectMocks
import org.mockito.Mock
import org.mockito.junit.jupiter.MockitoExtension
import org.mockito.kotlin.verify
import org.mockito.kotlin.verifyNoInteractions
import org.mockito.kotlin.whenever
import java.time.DayOfWeek
import java.time.LocalDate

@ExtendWith(MockitoExtension::class)
class MealPlanSchedulerTest {

    @Mock lateinit var mealPlanRepo: MealPlanRepository
    @Mock lateinit var recipeRepo: RecipeRepository

    @InjectMocks lateinit var scheduler: MealPlanScheduler

    private fun recipe(id: Long) =
        Recipe(id = id, name = "Recipe $id", createdByUsername = "admin", pickState = RecipePickState.CURRENT)

    private fun mealPlan(id: Long, recipe: Recipe, date: LocalDate) =
        MealPlan(id = id, recipe = recipe, plannedDate = date, createdByUsername = "admin")

    @Test
    fun `completeWeek sets current week recipes to PICKED`() {
        val monday = LocalDate.now().with(DayOfWeek.MONDAY)
        val r1 = recipe(1)
        val r2 = recipe(2)
        val entries = listOf(mealPlan(1, r1, monday), mealPlan(2, r2, monday.plusDays(2)))
        whenever(mealPlanRepo.findByPlannedDateBetween(monday, monday.plusDays(6))).thenReturn(entries)

        scheduler.completeWeek()

        assertThat(r1.pickState).isEqualTo(RecipePickState.PICKED)
        assertThat(r2.pickState).isEqualTo(RecipePickState.PICKED)
        verify(recipeRepo).save(r1)
        verify(recipeRepo).save(r2)
    }

    @Test
    fun `completeWeek does nothing when no entries for current week`() {
        val monday = LocalDate.now().with(DayOfWeek.MONDAY)
        whenever(mealPlanRepo.findByPlannedDateBetween(monday, monday.plusDays(6))).thenReturn(emptyList())

        scheduler.completeWeek()

        verifyNoInteractions(recipeRepo)
    }
}
