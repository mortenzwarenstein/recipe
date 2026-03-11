package nl.tenmore.recipeserver.mealplan

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.OneToOne
import jakarta.persistence.Table
import nl.tenmore.recipeserver.recipe.Recipe
import java.time.LocalDate

@Entity
@Table(name = "meal_plan_entries")
class MealPlan(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @OneToOne(optional = false)
    var recipe: Recipe,

    @Column(name = "planned_date", nullable = false, columnDefinition = "DATE", unique = true)
    val plannedDate: LocalDate,

    @Column(name = "created_by_username", nullable = false,)
    val createdByUsername: String
)
