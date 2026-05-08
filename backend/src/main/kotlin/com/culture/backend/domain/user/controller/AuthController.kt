package com.culture.backend.domain.user.controller

import com.culture.backend.domain.user.dto.request.LoginRequest
import com.culture.backend.domain.user.dto.request.SignupRequest
import com.culture.backend.domain.user.dto.response.AuthResponse
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/auth")
class AuthController(
    private val authService: AuthService
) {
    @PostMapping("/signup")
    fun signup(@RequestBody request: SignupRequest): ResponseEntity<Long> {
        return ResponseEntity.ok(authService.signup(request))
    }

    @PostMapping("/login")
    fun login(@RequestBody request: LoginRequest): ResponseEntity<AuthResponse> {
        return ResponseEntity.ok(authService.login(request))
    }
}