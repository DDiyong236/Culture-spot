package com.culture.backend.domain.user.dto

data class AuthResponse(
    val accessToken: String,
    val refreshToken: String,
    val role: String
)