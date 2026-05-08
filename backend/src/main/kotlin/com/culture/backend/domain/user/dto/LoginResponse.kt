package com.culture.backend.domain.user.dto.response

import com.culture.backend.domain.user.entity.Role

data class LoginResponse(
    val accessToken: String,
    val email: String,
    val name: String,
    val role: Role
)