package com.culture.backend.domain.place.repository

import org.springframework.stereotype.Repository
import com.culture.backend.domain.place.entity.Place
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param

@Repository
interface PlaceRepository: JpaRepository<Place, Long>{
    @Query("""
        SELECT p FROM Place p 
        WHERE (:address1 IS NULL OR p.address1 = :address1)
          AND (:address2 IS NULL OR p.address2 = :address2)
          AND (:address3 IS NULL OR p.address3 = :address3)
    """)
    fun findByHierarchicalAddress(
        @Param("address1") address1: String?,
        @Param("address2") address2: String?,
        @Param("address3") address3: String?
    ): List<Place>

    @Query("SELECT DISTINCT p.address1 FROM Place p WHERE p.address1 IS NOT NULL")
    fun findDistinctAddress1(): List<String>

    @Query("SELECT DISTINCT p.address2 FROM Place p WHERE p.address1 = :address1 AND p.address2 IS NOT NULL")
    fun findDistinctAddress2(@Param("address1") address1: String): List<String>

    @Query("SELECT DISTINCT p.address3 FROM Place p WHERE p.address1 = :address1 AND p.address2 = :address2 AND p.address3 IS NOT NULL")
    fun findDistinctAddress3(
        @Param("address1") address1: String,
        @Param("address2") address2: String
    ): List<String>
}