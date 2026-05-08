package com.culture.backend.domain.user.entity

import jakarta.persistence.*

@Entity
@Table(name = "group_profile")
class GroupProfile (
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "creator_profile_id", nullable = false)
    val creatorProfile: CreatorProfile,

    @Column(nullable = false)
    var groupName: String, // 그룹명

    @Column(nullable = false)
    var genre: String, // 장르 (예: 사진, 공연 등)

    @Column(nullable = false)
    var title: String, // 프로젝트 제목

    @Column
    var eventType: String? = null, // 이벤트 유형 (드롭다운: 전시, 공연 등)

    @Column
    var numberofLikes: Int = 0, // 좋아요 수

    @Column
    var desiredRegion: String? = null, // 희망 지역 (예: 연남)

    @Column
    var desiredTimeSlot: String? = null, // 희망 시간대 (드롭다운: 평일 오후 등)

    @Column(columnDefinition = "TEXT")
    var introduction: String? = null, // 프로젝트 소개

    @Column
    var portfolioUrl: String? = null, // 포트폴리오 URL

)