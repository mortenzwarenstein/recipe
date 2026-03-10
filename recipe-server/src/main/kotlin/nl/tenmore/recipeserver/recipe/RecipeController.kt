package nl.tenmore.recipeserver.recipe

import jakarta.validation.Valid
import nl.tenmore.recipeserver.recipe.dto.CreateRecipeRequest
import nl.tenmore.recipeserver.recipe.dto.PagedResponse
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
    fun findAll(
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "20") size: Int,
        @RequestParam(required = false) q: String?,
    ): ResponseEntity<PagedResponse<RecipeResponse>> = ResponseEntity.ok(recipeService.findAll(page, size, q))

    @GetMapping("/current")
    fun getCurrent(): ResponseEntity<RecipeResponse> =
        recipeService.getCurrent()?.let { ResponseEntity.ok(it) } ?: ResponseEntity.notFound().build()

    @PostMapping("/current/pick")
    fun pick(): ResponseEntity<RecipeResponse> =
        recipeService.pick(true)?.let { ResponseEntity.ok(it) } ?: ResponseEntity.notFound().build()

    @PostMapping("/current/skip")
    fun skipCurrent(): ResponseEntity<RecipeResponse> =
        recipeService.pick(false)?.let { ResponseEntity.ok(it) } ?: ResponseEntity.notFound().build()

    @GetMapping("/{id}")
    fun findById(@PathVariable id: Long): ResponseEntity<RecipeResponse> = ResponseEntity.ok(recipeService.findById(id))

    @PutMapping("/{id}")
    fun update(
        @PathVariable id: Long,
        @Valid @RequestBody request: UpdateRecipeRequest,
    ): ResponseEntity<RecipeResponse> = ResponseEntity.ok(recipeService.update(id, request))

    @DeleteMapping("/{id}")
    fun delete(
        @PathVariable id: Long,
        authentication: Authentication
    ): ResponseEntity<Void> {
        recipeService.delete(id, authentication.name, authentication.isAdmin())
        return ResponseEntity.noContent().build()
    }

    @GetMapping("/books")
    fun getBooks(@RequestParam(required = false) q: String?): ResponseEntity<List<String>> =
        ResponseEntity.ok(recipeService.getBooks(q))

    private fun Authentication.isAdmin(): Boolean =
        authorities.any { it.authority == "ROLE_ADMIN" }
}
