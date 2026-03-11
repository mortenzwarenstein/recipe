package nl.tenmore.recipeserver

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication
import org.springframework.scheduling.annotation.EnableScheduling

@SpringBootApplication
@EnableScheduling
class RecipeServerApplication

fun main(args: Array<String>) {
    runApplication<RecipeServerApplication>(*args)
}
