package com.culture.backend.domain.place.service

import com.culture.backend.domain.place.dto.PlaceRequest
import com.culture.backend.domain.place.dto.PlaceResponse
import com.culture.backend.domain.place.entity.Place
import com.culture.backend.domain.place.repository.PlaceRepository
import com.culture.backend.domain.user.repository.UserRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
@Transactional(readOnly = true) // 기본적으로 읽기 전용으로 설정 (성능 최적화)
class PlaceService(
    private val placeRepository: PlaceRepository,
    private val userRepository: UserRepository
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
    fun registerPlace(request: PlaceRequest, userId: Long): Long {

        val provider = userRepository.findById(userId)
            .orElseThrow { IllegalArgumentException("${userId}번 유저를 찾을 수 없습니다") }

        val place = Place(
            provider = provider,
            title = request.title,
            description = request.description,
            address1 = request.address1,
            address2 = request.address2,
            address3 = request.address3,
            address4 = request.address4,
            openinghours = request.openinghours,
            seatCount = request.seatCount,
            allowSound = request.allowSound,
            pricingType = request.pricingType,
            thumbnailUrl = request.thumbnailUrl,
            spaceUrl = request.spaceUrl,
            preferedEventTypes = request.preferedEventTypes.toMutableList()
        )
        return placeRepository.save(place).id!!
    }
}