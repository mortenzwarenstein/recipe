package nl.tenmore.recipeserver.recipe

import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query

interface RecipeRepository : JpaRepository<Recipe, Long> {
    fun findAllByPickStateIn(recipePickStates: List<RecipePickState>): List<Recipe>

    @Query("SELECT DISTINCT r.book FROM Recipe r WHERE r.book IS NOT NULL ORDER BY r.book")
    fun fetchDistinctBooks(pageable: Pageable): List<String>

    @Query("SELECT DISTINCT r.book FROM Recipe r WHERE r.book IS NOT NULL AND LOWER(r.book) LIKE LOWER(CONCAT('%', :book, '%')) ORDER BY r.book")
    fun fetchDistinctBooksByBook(book: String, pageable: Pageable): List<String>
}