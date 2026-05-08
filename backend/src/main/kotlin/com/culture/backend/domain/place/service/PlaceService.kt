package com.culture.backend.domain.place.service

import com.culture.backend.domain.place.dto.PlaceResponse
import com.culture.backend.domain.place.repository.PlaceRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
@Transactional(readOnly = true) // 기본적으로 읽기 전용으로 설정 (성능 최적화)
class PlaceService(
    private val placeRepository: PlaceRepository
) {

    fun getAllPlaces(): List<PlaceResponse> {
        return placeRepository.findAll().map { place ->
            PlaceResponse.from(place)
        }
    }

    fun searchPlaces(
        address1: String?,
        address2: String?,
        address3: String?
    ): List<PlaceResponse> {
        val results = placeRepository.findByHierarchicalAddress(address1, address2, address3)
        return results.map { PlaceResponse.from(it) }
    }

    fun getAvailableCities(): List<String> {
        return placeRepository.findDistinctAddress1()
    }

    fun getAvailableDistricts(city: String): List<String> {
        return placeRepository.findDistinctAddress2(city)
    }

    fun getAvailableNeighborhoods(city: String, district: String): List<String> {
        return placeRepository.findDistinctAddress3(city, district)
    }
}