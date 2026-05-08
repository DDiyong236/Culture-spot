package com.culture.backend.domain.user.entity

import com.culture.backend.global.common.BaseTimeEntity
import jakarta.persistence.*

@Entity
@Table(name = "creator_profiles")
class CreatorProfile(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    val user: User,

    @Column(nullable = false, length = 255)
    var snsLink: String,

    @Column(nullable = false, length = 50)
    var category: String

) : BaseTimeEntity() {

    fun updateProfile(snsLink: String, category: String) {
        this.snsLink = snsLink
        this.category = category
    }
}