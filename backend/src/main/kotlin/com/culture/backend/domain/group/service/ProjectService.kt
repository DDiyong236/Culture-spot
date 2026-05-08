package com.culture.backend.domain.group.service

import com.culture.backend.domain.group.Entity.Project
import com.culture.backend.domain.group.dto.ProjectRequest
import com.culture.backend.domain.group.repository.ProjectRepository
import com.culture.backend.domain.user.repository.UserRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
@Transactional
class ProjectService (
    private val projectRepository: ProjectRepository,
    private val userRepository: UserRepository
){
    @Transactional
    fun registerProject(request: ProjectRequest, userId: Long): Long{
        val user = userRepository.findById(userId)
            .orElseThrow { IllegalArgumentException("존재하지 않는 크리에이터입니다.") }
        val project = Project(
            creator = user,
            title = request.title,
            eventType = request.eventType,
            genre = request.genre,
            preferredLocation = request.preferredLocation,
            preferredTime = request.preferredTime,
            description = request.description,
            portfolioUrl = request.portfolioUrl
        )

        return projectRepository.save(project).id!!
    }
    fun getAllProjects(): List<Project>{
        return projectRepository.findAll()
    }
    fun getProjectById(id: Long): Project{
        return projectRepository.findById(id)
            .orElseThrow { IllegalArgumentException("해당 프로젝트를 찾을 수 없습니다.") }
    }
}