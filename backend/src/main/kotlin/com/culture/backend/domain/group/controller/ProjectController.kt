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
        @AuthenticationPrincipal userId: Long
    ): ResponseEntity<Long> {
        val projectId = projectService.registerProject(request, userId)
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