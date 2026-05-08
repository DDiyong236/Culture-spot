package com.culture.backend.domain.user.service

import com.culture.backend.domain.user.dto.AuthResponse
import com.culture.backend.domain.user.dto.SignupRequest
import com.culture.backend.domain.user.dto.request.LoginRequest
import com.culture.backend.domain.user.entity.User
import com.culture.backend.domain.user.repository.UserRepository
import com.culture.backend.global.util.JwtUtil
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
@Transactional
class AuthService(
    private val userRepository: UserRepository,
    private val passwordEncoder: PasswordEncoder,
    private val jwtUtil: JwtUtil
) {

    @Transactional
    fun signup(request: SignupRequest): Long {
        // 1. 이메일 중복 체크
        if (userRepository.findByEmail(request.email).isPresent) {
            throw IllegalArgumentException("이미 존재하는 이메일입니다.")
        }

        val rawPassword = request.password

        val user = User(
            email = request.email,
            password = passwordEncoder.encode(rawPassword) as String,
            name = request.name,
            role = request.role
        )

        return userRepository.save(user).id!!
    }

    @Transactional(readOnly = true)
    fun login(request: LoginRequest): AuthResponse {
        val user = userRepository.findByEmail(request.email)
            .orElseThrow { IllegalArgumentException("존재하지 않는 사용자입니다.") }

        if (!passwordEncoder.matches(request.password, user.password)) {
            throw IllegalArgumentException("비밀번호가 일치하지 않습니다.")
        }

        val accessToken = jwtUtil.generateAccessToken(user.id!!, user.email, user.role.name)
        val refreshToken = jwtUtil.generateRefreshToken(user.id!!)

        return AuthResponse(
            accessToken = accessToken,
            refreshToken = refreshToken,
            role = user.role.name
        )
    }
}