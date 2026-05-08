package com.culture.backend.domain.user.entity

import jakarta.persistence.*

@Entity
@Table(name = "provider_profiles")
class ProviderProfile(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    val user: User,

    @Column(nullable = false, length = 50)
    var businessNumber: String, // 사업자 등록 번호
)