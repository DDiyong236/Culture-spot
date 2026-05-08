package com.culture.backend.domain.place.dto

import com.culture.backend.domain.place.entity.Place
data class PlaceResponse(
    val id: Long?,
    val title: String,
    val address: String,
    val seatCount: Int,
    val openinghours: String?,
    val allowSound: String?,
    val thumbnailUrl: String?,
    val description: String?,
    val preferedEventTypes: List<String>?
){
    companion object {
        fun from(place: Place): PlaceResponse {
            return PlaceResponse(
                id = place.id,
                title = place.title,
                address = place.address,
                seatCount = place.seatCount,
                openinghours = place.openinghours,
                allowSound = place.allowSound,
                thumbnailUrl = place.thumbnailUrl,
                description = place.description,
                preferedEventTypes = place.preferedEventTypes
            )
        }
    }
}