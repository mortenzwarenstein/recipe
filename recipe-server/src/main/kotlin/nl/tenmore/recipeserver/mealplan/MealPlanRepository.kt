package nl.tenmore.recipeserver.mealplan

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.time.LocalDate

@Repository
interface MealPlanRepository: JpaRepository<MealPlan, Long> {
    fun findByPlannedDate(date: LocalDate): MealPlan?
    fun findByPlannedDateBetween(start: LocalDate, end: LocalDate): List<MealPlan>
    fun deleteByPlannedDate(date: LocalDate)
}