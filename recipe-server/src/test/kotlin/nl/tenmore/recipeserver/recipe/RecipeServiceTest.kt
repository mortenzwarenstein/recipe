package nl.tenmore.recipeserver.recipe

import nl.tenmore.recipeserver.recipe.dto.CreateRecipeRequest
import nl.tenmore.recipeserver.recipe.dto.UpdateRecipeRequest
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.InjectMocks
import org.mockito.Mock
import org.mockito.junit.jupiter.MockitoExtension
import org.mockito.kotlin.any
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever
import org.springframework.data.domain.PageImpl
import org.springframework.data.domain.Pageable
import org.springframework.web.server.ResponseStatusException
import java.util.Optional

@ExtendWith(MockitoExtension::class)
class RecipeServiceTest {

    @Mock lateinit var recipeRepository: RecipeRepository
    @Mock lateinit var calorieLookupService: CalorieLookupService

    @InjectMocks lateinit var service: RecipeService

    private fun recipe(
        id: Long = 1,
        name: String = "Test Recipe",
        pickState: RecipePickState = RecipePickState.NOT_PICKED,
    ) = Recipe(id = id, name = name, createdByUsername = "admin", pickState = pickState)

    @Test
    fun `create saves recipe and returns response`() {
        val r = recipe(name = "Pasta")
        val request = CreateRecipeRequest(name = "Pasta", book = "Silver Spoon", pageNumber = 42)
        whenever(recipeRepository.save(any())).thenReturn(r)

        val result = service.create(request, "admin")

        assertThat(result.name).isEqualTo("Pasta")
        verify(recipeRepository).save(any())
    }

    @Test
    fun `findAll returns paged results without query`() {
        whenever(recipeRepository.findAll(any<Pageable>())).thenReturn(PageImpl(listOf(recipe(1), recipe(2))))

        val result = service.findAll(0, 20, null)

        assertThat(result.content).hasSize(2)
        assertThat(result.totalElements).isEqualTo(2)
    }

    @Test
    fun `findAll uses name search when query is provided`() {
        whenever(recipeRepository.findAllByNameContaining(any<String>(), any<Pageable>()))
            .thenReturn(PageImpl(listOf(recipe(1, name = "Pasta"))))

        val result = service.findAll(0, 20, "pasta")

        assertThat(result.content).hasSize(1)
        assertThat(result.content[0].name).isEqualTo("Pasta")
    }

    @Test
    fun `findById returns recipe when found`() {
        val r = recipe(1)
        whenever(recipeRepository.findById(1L)).thenReturn(Optional.of(r))

        assertThat(service.findById(1L).id).isEqualTo(1)
    }

    @Test
    fun `findById throws 404 when not found`() {
        whenever(recipeRepository.findById(99L)).thenReturn(Optional.empty())

        assertThrows<ResponseStatusException> { service.findById(99L) }
    }

    @Test
    fun `update changes fields and saves`() {
        val existing = recipe(1, name = "Old Name")
        whenever(recipeRepository.findById(1L)).thenReturn(Optional.of(existing))
        whenever(recipeRepository.save<Recipe>(any())).thenReturn(existing)

        service.update(1L, UpdateRecipeRequest(name = "New Name", book = null, pageNumber = null, calories = null))

        assertThat(existing.name).isEqualTo("New Name")
    }

    @Test
    fun `update throws 404 when recipe not found`() {
        whenever(recipeRepository.findById(99L)).thenReturn(Optional.empty())

        assertThrows<ResponseStatusException> {
            service.update(99L, UpdateRecipeRequest(name = "x", book = null, pageNumber = null, calories = null))
        }
    }

    @Test
    fun `getCurrent returns current recipe when one exists`() {
        val current = recipe(1, pickState = RecipePickState.CURRENT)
        whenever(recipeRepository.findAllByPickStateIn(listOf(RecipePickState.CURRENT))).thenReturn(listOf(current))

        assertThat(service.getCurrent()?.id).isEqualTo(1)
    }

    @Test
    fun `pick marks previous recipe as NOT_PICKED and sets next as CURRENT`() {
        val current = recipe(1, pickState = RecipePickState.CURRENT)
        val candidate = recipe(2, pickState = RecipePickState.NOT_PICKED)
        whenever(recipeRepository.findAll()).thenReturn(listOf(current, candidate))
        whenever(recipeRepository.save(current)).thenReturn(current)
        whenever(recipeRepository.save(candidate)).thenReturn(candidate)

        service.pick(false)

        assertThat(current.pickState).isEqualTo(RecipePickState.NOT_PICKED)
        assertThat(candidate.pickState).isEqualTo(RecipePickState.CURRENT)
    }

    @Test
    fun `pick marks previous recipe as PICKED when currentIsPicked is true`() {
        val current = recipe(1, pickState = RecipePickState.CURRENT)
        val candidate = recipe(2, pickState = RecipePickState.NOT_PICKED)
        whenever(recipeRepository.findAll()).thenReturn(listOf(current, candidate))
        whenever(recipeRepository.save(current)).thenReturn(current)
        whenever(recipeRepository.save(candidate)).thenReturn(candidate)

        service.pick(true)

        assertThat(current.pickState).isEqualTo(RecipePickState.PICKED)
    }

    @Test
    fun `pick resets all other recipes when no NOT_PICKED candidates remain`() {
        val current = recipe(1, pickState = RecipePickState.CURRENT)
        val picked = recipe(2, pickState = RecipePickState.PICKED)
        whenever(recipeRepository.findAll()).thenReturn(listOf(current, picked))
        whenever(recipeRepository.save(current)).thenReturn(current)
        whenever(recipeRepository.save(picked)).thenReturn(picked)
        whenever(recipeRepository.saveAll<Recipe>(any<List<Recipe>>())).thenReturn(listOf(picked))

        service.pick(false)

        assertThat(picked.pickState).isEqualTo(RecipePickState.CURRENT)
    }

    @Test
    fun `pick throws 404 when no recipes exist`() {
        whenever(recipeRepository.findAll()).thenReturn(emptyList())

        assertThrows<ResponseStatusException> { service.pick(false) }
    }

    @Test
    fun `delete removes recipe when called by owner`() {
        val r = recipe(1)
        whenever(recipeRepository.findById(1L)).thenReturn(Optional.of(r))

        service.delete(1L, "admin", false)

        verify(recipeRepository).delete(r)
    }

    @Test
    fun `delete throws 403 when called by non-owner without admin role`() {
        whenever(recipeRepository.findById(1L)).thenReturn(Optional.of(recipe(1)))

        assertThrows<ResponseStatusException> { service.delete(1L, "other", false) }
    }

    @Test
    fun `delete succeeds for admin regardless of ownership`() {
        val r = recipe(1)
        whenever(recipeRepository.findById(1L)).thenReturn(Optional.of(r))

        service.delete(1L, "other", true)

        verify(recipeRepository).delete(r)
    }

    @Test
    fun `delete throws 404 when recipe not found`() {
        whenever(recipeRepository.findById(99L)).thenReturn(Optional.empty())

        assertThrows<ResponseStatusException> { service.delete(99L, "admin", true) }
    }
}
