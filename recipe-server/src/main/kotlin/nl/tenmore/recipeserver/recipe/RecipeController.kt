package nl.tenmore.recipeserver.recipe

import jakarta.validation.Valid
import nl.tenmore.recipeserver.recipe.dto.CreateRecipeRequest
import nl.tenmore.recipeserver.recipe.dto.RecipeResponse
import nl.tenmore.recipeserver.recipe.dto.UpdateRecipeRequest
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/recipes")
class RecipeController(private val recipeService: RecipeService) {

    @PostMapping
    fun create(
        @Valid @RequestBody request: CreateRecipeRequest,
        authentication: Authentication
    ): ResponseEntity<RecipeResponse> =
        ResponseEntity.status(HttpStatus.CREATED).body(recipeService.create(request, authentication.name))

    @GetMapping
    fun findAll(): List<RecipeResponse> = recipeService.findAll()

    @GetMapping("/{id}")
    fun findById(@PathVariable id: Long): RecipeResponse = recipeService.findById(id)

    @PutMapping("/{id}")
    fun update(
        @PathVariable id: Long,
        @Valid @RequestBody request: UpdateRecipeRequest,
        authentication: Authentication
    ): RecipeResponse = recipeService.update(id, request, authentication.name, authentication.isAdmin())

    @DeleteMapping("/{id}")
    fun delete(
        @PathVariable id: Long,
        authentication: Authentication
    ): ResponseEntity<Void> {
        recipeService.delete(id, authentication.name, authentication.isAdmin())
        return ResponseEntity.noContent().build()
    }

    private fun Authentication.isAdmin(): Boolean =
        authorities.any { it.authority == "ROLE_ADMIN" }
}
