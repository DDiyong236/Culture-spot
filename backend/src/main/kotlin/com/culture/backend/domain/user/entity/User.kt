package com.culture.backend.domain.user.entity

import com.culture.backend.global.common.BaseTimeEntity
import jakarta.persistence.*

@Entity
@Table(name = "users")
class User(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,

    @Column(nullable = false, unique = true, length = 100)
    var email: String,

    @Column(nullable = false)
    var password: String,

    @Column(nullable = false, length = 50)
    var name: String,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    var role: Role

) : BaseTimeEntity() {

    fun updateName(newName: String) {
        this.name = newName
    }

    fun updateRole(newRole: Role) {
        this.role = newRole
    }
}