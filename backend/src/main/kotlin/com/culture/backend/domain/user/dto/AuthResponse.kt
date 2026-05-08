package com.culture.backend.domain.user.dto

data class AuthResponse(
    val accessToken: String,
    val refreshToken: String,
    val role: String,
    val userId: Long,
    val email: String,
    val name: String
)
