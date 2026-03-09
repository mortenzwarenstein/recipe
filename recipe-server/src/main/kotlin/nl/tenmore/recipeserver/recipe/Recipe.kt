package nl.tenmore.recipeserver.recipe

import jakarta.persistence.*
import java.time.Instant

@Entity
@Table(name = "recipes")
class Recipe(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(nullable = false)
    var name: String = "",

    @Column(nullable = true)
    var book: String? = null,

    @Column(nullable = true)
    var pageNumber: Int? = null,

    @Column(nullable = false)
    val createdByUsername: String = "",

    @Column(nullable = false, updatable = false)
    val createdAt: Instant = Instant.now(),

    @Column(nullable = false)
    var pickState: RecipePickState = RecipePickState.NOT_PICKED
)
