package com.culture.backend.domain.group.repository

import com.culture.backend.domain.group.Entity.Project
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface ProjectRepository : JpaRepository<Project, Long> {
    fun findByCreatorId(creatorId: Long): List<Project>

    fun findByTitleContaining(title: String): List<Project>
}