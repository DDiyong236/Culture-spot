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
    var address1: String,
    @Column(nullable = false)
    var address2: String,
    @Column(nullable = false)
    var address3: String,
    @Column(nullable = false)
    var address4: String,

    @Column
    var openinghours: String? = null,

    @Column
    var seatCount: Int,

    @Column
    var allowSound: String,

    @Column(nullable = false)
    var pricingType: Boolean,

    @Column
    var thumbnailUrl: String? = null,

    @Column
    var spaceUrl: String? = null,

    @ElementCollection
    @CollectionTable(name = "place_event_types", joinColumns = [JoinColumn(name = "place_id")])
    var preferedEventTypes: MutableList<String> = mutableListOf()


) : BaseTimeEntity()