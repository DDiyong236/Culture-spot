package com.culture.backend.domain.place.dto

data class PlaceRequest(
    val title: String,
    val description: String,
    val address1: String,
    val address2: String,
    val address3: String,
    val address4: String,
    val openinghours: String?,
    val seatCount: Int,
    val allowSound: String,
    val pricingType: Boolean,
    val thumbnailUrl: String?,
    val spaceUrl: String?,
    val preferedEventTypes: List<String> = emptyList(),
    val preferredEventTypes: List<String> = emptyList()
)
