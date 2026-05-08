package com.culture.backend.domain.user.controller

import com.culture.backend.domain.user.dto.AuthResponse
import com.culture.backend.domain.user.dto.request.LoginRequest
import com.culture.backend.domain.user.dto.request.RefreshRequest
import com.culture.backend.domain.user.dto.SignupRequest
import com.culture.backend.domain.user.service.AuthService
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

    @PostMapping("/refresh")
    fun refresh(@RequestBody request: RefreshRequest): ResponseEntity<AuthResponse> {
        return ResponseEntity.ok(authService.refresh(request))
    }
}
