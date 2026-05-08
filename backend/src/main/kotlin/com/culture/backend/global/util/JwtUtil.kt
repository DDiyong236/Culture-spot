package com.culture.backend.global.util

import io.jsonwebtoken.Jwts
import io.jsonwebtoken.security.Keys
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Component
import java.util.Date
import javax.crypto.SecretKey

@Component
class JwtUtil(
    @Value("\${jwt.secret}") private val secretString: String,
    @Value("\${jwt.access-expiration}") private val accessExp: Long,
    @Value("\${jwt.refresh-expiration}") val refreshExp: Long,
) {
    private val secretKey: SecretKey = Keys.hmacShaKeyFor(secretString.toByteArray())

    // Access Token 생성 (Role 정보 추가)
    fun generateAccessToken(
        id: Long,
        email: String,
        role: String,
    ): String {
        val now = Date()
        val validity = Date(now.time + accessExp)

        return Jwts.builder()
            .subject(id.toString())
            .claim("email", email)
            .claim("role", role) // Role 정보 추가
            .issuedAt(now)
            .expiration(validity)
            .signWith(secretKey)
            .compact()
    }

    // Refresh Token 생성
    fun generateRefreshToken(id: Long): String {
        val now = Date()
        val validity = Date(now.time + refreshExp)

        return Jwts.builder()
            .subject(id.toString())
            .issuedAt(now)
            .expiration(validity)
            .signWith(secretKey)
            .compact()
    }

    // 토큰에서 ID 추출
    fun getIdFromToken(token: String): Long {
        val subject = Jwts.parser()
            .verifyWith(secretKey)
            .build()
            .parseSignedClaims(token)
            .payload
            .subject

        return subject.toLong()
    }

    // 토큰에서 Role 추출 (추가됨)
    fun getRoleFromToken(token: String): String? {
        return Jwts.parser()
            .verifyWith(secretKey)
            .build()
            .parseSignedClaims(token)
            .payload
            .get("role", String::class.java)
    }

    // 토큰 유효성 검사
    fun validateToken(token: String): Boolean =
        try {
            Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
            true
        } catch (e: Exception) {
            false
        }
}