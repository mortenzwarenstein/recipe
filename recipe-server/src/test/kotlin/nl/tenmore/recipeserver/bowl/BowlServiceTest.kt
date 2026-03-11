package nl.tenmore.recipeserver.bowl

import nl.tenmore.recipeserver.recipe.RecipePickState
import nl.tenmore.recipeserver.recipe.RecipeRepository
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.InjectMocks
import org.mockito.Mock
import org.mockito.junit.jupiter.MockitoExtension
import org.mockito.kotlin.whenever

@ExtendWith(MockitoExtension::class)
class BowlServiceTest {

    @Mock lateinit var repo: RecipeRepository

    @InjectMocks lateinit var service: BowlService

    @Test
    fun `get returns correct remaining and picked counts`() {
        whenever(repo.countAll()).thenReturn(10)
        whenever(repo.countByPickState(RecipePickState.PICKED)).thenReturn(3)

        val result = service.get()

        assertThat(result.recipesLeft).isEqualTo(7)
        assertThat(result.recipesPicked).isEqualTo(3)
    }

    @Test
    fun `get returns full count when nothing has been picked`() {
        whenever(repo.countAll()).thenReturn(5)
        whenever(repo.countByPickState(RecipePickState.PICKED)).thenReturn(0)

        val result = service.get()

        assertThat(result.recipesLeft).isEqualTo(5)
        assertThat(result.recipesPicked).isEqualTo(0)
    }

    @Test
    fun `get returns zero remaining when all recipes are picked`() {
        whenever(repo.countAll()).thenReturn(4)
        whenever(repo.countByPickState(RecipePickState.PICKED)).thenReturn(4)

        val result = service.get()

        assertThat(result.recipesLeft).isEqualTo(0)
        assertThat(result.recipesPicked).isEqualTo(4)
    }
}
