package com.culture.backend.domain.place.repository

import org.springframework.stereotype.Repository
import com.culture.backend.domain.place.entity.Place
import org.springframework.data.jpa.repository.JpaRepository

@Repository
interface PlaceRepository: JpaRepository<Place, Long>