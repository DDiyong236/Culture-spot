package com.culture.backend.global.filter

import com.culture.backend.global.util.JwtUtil
import jakarta.servlet.FilterChain
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Component
import org.springframework.web.filter.OncePerRequestFilter

@Component
class JwtAuthenticationFilter(
    private val jwtUtil: JwtUtil,
) : OncePerRequestFilter() {

    override fun doFilterInternal(
        request: HttpServletRequest,
        response: HttpServletResponse,
        filterChain: FilterChain,
    ) {
        val bearerToken = request.getHeader("Authorization")
        val token = if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            bearerToken.substring(7)
        } else {
            null
        }

        if (token != null && jwtUtil.validateToken(token)) {
            val userId = jwtUtil.getIdFromToken(token)
            val role = jwtUtil.getRoleFromToken(token)

            // Spring Security 권한 목록 생성 (ROLE_ 접두사를 붙이는 것이 표준입니다)
            val authorities = if (role != null) {
                listOf(SimpleGrantedAuthority("ROLE_$role"))
            } else {
                emptyList()
            }

            // 인증 객체 생성 및 Context에 저장
            val authentication = UsernamePasswordAuthenticationToken(userId, null, authorities)
            SecurityContextHolder.getContext().authentication = authentication
        }

        filterChain.doFilter(request, response)
    }
}