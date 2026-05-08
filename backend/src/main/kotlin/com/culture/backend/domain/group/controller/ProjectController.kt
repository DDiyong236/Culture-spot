package com.culture.backend.domain.group.controller

import com.culture.backend.domain.group.Entity.Project
import com.culture.backend.domain.group.dto.ProjectRequest
import com.culture.backend.domain.group.service.ProjectService
import org.springframework.http.ResponseEntity
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.CrossOrigin
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/projects")
@CrossOrigin(origins = ["http://localhost:3000"])
class ProjectController (
    private val projectService: ProjectService
){
    @PostMapping
    fun registerProject(
        @RequestBody request: ProjectRequest,
        @AuthenticationPrincipal userId: Long?,
        @RequestParam(required = false) creatorId: Long?
    ): ResponseEntity<Long> {
        val resolvedUserId = userId
            ?: creatorId
            ?: throw IllegalArgumentException("프로젝트 등록에는 사용자 정보가 필요합니다.")
        val projectId = projectService.registerProject(request, resolvedUserId)
        return ResponseEntity.ok(projectId)
    }

    @GetMapping
    fun getAllProjects(): ResponseEntity<List<Project>> {
        val projects = projectService.getAllProjects()
        return ResponseEntity.ok(projects)
    }
    @GetMapping("/{id}")
    fun getProjectById(@PathVariable id: Long): ResponseEntity<Project> {
        val project = projectService.getProjectById(id)
        return ResponseEntity.ok(project)
    }
}
