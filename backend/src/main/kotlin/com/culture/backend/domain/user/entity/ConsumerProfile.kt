package com.culture.backend.domain.user.entity

import com.culture.backend.global.common.BaseTimeEntity
import jakarta.persistence.*

@Entity
@Table(name = "consumer_profiles")
class ConsumerProfile(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    val user: User,

    @Column(length = 50)
    var nickname: String,

    @Column(length = 20)
    var phoneNumber: String? = null

) : BaseTimeEntity() {

    fun updateProfile(nickname: String, phoneNumber: String?) {
        this.nickname = nickname
        this.phoneNumber = phoneNumber
    }
}