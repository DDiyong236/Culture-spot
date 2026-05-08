package com.culture.backend.domain.user.dto

import com.culture.backend.domain.user.entity.Role

data class SignupRequest(
    val email: String,
    val password: String,
    val name: String,
    val role: Role
)