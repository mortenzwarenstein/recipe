package nl.tenmore.recipeserver.mealplan

import nl.tenmore.recipeserver.recipe.RecipePickState
import nl.tenmore.recipeserver.recipe.RecipeRepository
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Transactional
import java.time.DayOfWeek
import java.time.LocalDate

@Component
class MealPlanScheduler(
    private val mealPlanRepo: MealPlanRepository,
    private val recipeRepo: RecipeRepository
) {

    @Scheduled(cron = "0 59 23 * * SUN")
    @Transactional
    fun completeWeek() {
        val monday = LocalDate.now().with(DayOfWeek.MONDAY)
        val sunday = monday.plusDays(6)
        val entries = mealPlanRepo.findByPlannedDateBetween(monday, sunday)
        entries.forEach { entry ->
            entry.recipe.pickState = RecipePickState.PICKED
            recipeRepo.save(entry.recipe)
        }
    }
}
