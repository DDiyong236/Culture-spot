package com.culture.backend.domain.place.entity

import com.culture.backend.domain.user.entity.User
import com.culture.backend.global.common.BaseTimeEntity
import jakarta.persistence.*

@Entity
class Place(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "provider_id")
    val provider: User,

    @Column(nullable = false)
    var title: String,

    @Column(columnDefinition = "TEXT")
    var description: String,

    @Column(nullable = false)
    var address: String,

    @Column(nullable = false)
    var price: Boolean,

    @Column
    var thumbnailUrl: String? = null // 장소 대표 이미지 (S3 대신 일단 샘플 URL 사용 가능)

) : BaseTimeEntity()