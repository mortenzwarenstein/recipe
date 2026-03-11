package nl.tenmore.recipeserver.mealplan

import nl.tenmore.recipeserver.mealplan.dto.MealPlanResponse
import org.springframework.http.ResponseEntity
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/mealplan")
class MealPlanController(private val mealPlanService: MealPlanService) {

    @GetMapping
    fun getMealPlan(@RequestParam date: String): ResponseEntity<List<MealPlanResponse>> =
        ResponseEntity.ok(mealPlanService.getMealPlanByDate(date))

    @PutMapping("/{date}")
    fun updateMealPlan(
        @PathVariable date: String,
        authentication: Authentication
    ): ResponseEntity<MealPlanResponse> =
        ResponseEntity.ok(mealPlanService.setMealPlanByDate(date, authentication.name))

    @DeleteMapping
    fun clearWeek(@RequestParam week: String): ResponseEntity<Void> {
        mealPlanService.clearWeek(week)
        return ResponseEntity.noContent().build()
    }

    @DeleteMapping("/{date}")
    fun deleteMealPlan(@PathVariable date: String): ResponseEntity<Void> {
        mealPlanService.deleteMealPlan(date)
        return ResponseEntity.noContent().build()
    }
}
