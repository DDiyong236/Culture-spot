package com.culture.backend.global.config

import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity
import org.springframework.security.web.SecurityFilterChain
import org.springframework.web.cors.CorsConfiguration
import org.springframework.web.cors.CorsConfigurationSource
import org.springframework.web.cors.UrlBasedCorsConfigurationSource

@Configuration
@EnableWebSecurity
class SecurityConfig {

    @Bean
    fun filterChain(http: HttpSecurity): SecurityFilterChain {
        http
            .cors { it.configurationSource(corsConfigurationSource()) } // CORS 설정 연결
            .csrf { it.disable() }
            .formLogin { it.disable() }
            .httpBasic { it.disable() }
            .authorizeHttpRequests { auth ->
                auth
                    .requestMatchers("/api/places/**").permitAll()
                    .requestMatchers("/projects/**").permitAll()
                    .anyRequest().authenticated()
            }

        return http.build()
    }

    // CORS 세부 설정
    @Bean
    fun corsConfigurationSource(): CorsConfigurationSource {
        val configuration = CorsConfiguration()

        // 프론트엔드 서버 주소 허용
        configuration.allowedOrigins = listOf("http://localhost:3000")
        // 모든 HTTP 메서드(GET, POST, PUT, DELETE 등) 허용
        configuration.allowedMethods = listOf("GET", "POST", "PUT", "DELETE", "OPTIONS")
        // 모든 헤더 허용
        configuration.allowedHeaders = listOf("*")
        // 내 요청에 쿠키나 인증 정보를 포함할 수 있도록 허용
        configuration.allowCredentials = true

        val source = UrlBasedCorsConfigurationSource()
        source.registerCorsConfiguration("/**", configuration)
        return source
    }
}
