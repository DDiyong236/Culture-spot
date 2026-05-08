package com.culture.backend.domain.place.controller

import com.culture.backend.domain.place.dto.PlaceRequest
import com.culture.backend.domain.place.dto.PlaceResponse
import com.culture.backend.domain.place.service.PlaceService
import org.springframework.http.ResponseEntity
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/places")
class PlaceController(
    private val placeService: PlaceService
) {

    @GetMapping("/search")
    fun searchPlaces(
        @RequestParam(required = false) address1: String?,
        @RequestParam(required = false) address2: String?,
        @RequestParam(required = false) address3: String?
    ): ResponseEntity<List<PlaceResponse>> {
        val results = placeService.searchPlaces(address1, address2, address3)
        return ResponseEntity.ok(results)
    }

    @GetMapping
    fun getAllPlaces(): ResponseEntity<List<PlaceResponse>> {
        return ResponseEntity.ok(placeService.getAllPlaces())
    }

    @GetMapping("/regions/cities")
    fun getCities(): ResponseEntity<List<String>> {
        return ResponseEntity.ok(placeService.getAvailableCities())
    }

    @GetMapping("/regions/districts")
    fun getDistricts(@RequestParam city: String): ResponseEntity<List<String>> {
        return ResponseEntity.ok(placeService.getAvailableDistricts(city))
    }

    @GetMapping("/regions/neighborhoods")
    fun getNeighborhoods(
        @RequestParam city: String,
        @RequestParam district: String
    ): ResponseEntity<List<String>> {
        return ResponseEntity.ok(placeService.getAvailableNeighborhoods(city, district))
    }
    @PostMapping
    fun registerPlace(
        @RequestBody request: PlaceRequest,
        @AuthenticationPrincipal userId: Long
    ): ResponseEntity<Long> {
        val placeId = placeService.registerPlace(request, userId)
        return ResponseEntity.ok(placeId)
    }
}
