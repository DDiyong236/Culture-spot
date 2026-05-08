package com.culture.backend.domain.group.dto

data class ProjectRequest(
    val title: String,
    val eventType: String,
    val genre: String,
    val preferredLocation: String,
    val preferredTime: String,
    val portfolioUrl: String,
    val description: String,
)