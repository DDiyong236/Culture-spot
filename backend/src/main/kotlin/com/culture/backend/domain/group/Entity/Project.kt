package com.culture.backend.domain.group.Entity

import com.culture.backend.domain.user.entity.User
import com.culture.backend.global.common.BaseTimeEntity
import jakarta.persistence.*

@Entity
class Project(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "creator_id")
    val creator: User,

    @Column(nullable = false)
    var title: String,

    @Column
    var eventType: String,

    @Column
    var genre: String,

    @Column(columnDefinition = "TEXT")
    var description: String,

    @Column
    var preferredLocation: String,

    @Column
    var preferredTime: String,

    @Column
    var portfolioUrl: String,

) : BaseTimeEntity()