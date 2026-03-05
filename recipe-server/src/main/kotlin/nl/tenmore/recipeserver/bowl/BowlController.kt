package nl.tenmore.recipeserver.bowl

import nl.tenmore.recipeserver.bowl.dto.BowlResponse
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/bowl")
class BowlController(private val bowlService: BowlService) {

    @GetMapping
    fun getBowl(): ResponseEntity<BowlResponse> = ResponseEntity.ok(bowlService.get())
}