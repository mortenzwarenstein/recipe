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

    @Column(nullable = false)
    var book: String = "",

    @Column(nullable = false)
    var pageNumber: Int = 0,

    @Column(nullable = false)
    val createdByUsername: String = "",

    @Column(nullable = false, updatable = false)
    val createdAt: Instant = Instant.now()
)
