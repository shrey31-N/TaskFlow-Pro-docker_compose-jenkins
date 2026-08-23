package com.taskflow.projectservice.service.impl;

import com.taskflow.projectservice.dto.CreateProjectRequest;
import com.taskflow.projectservice.dto.ProjectResponse;
import com.taskflow.projectservice.dto.UpdateProjectRequest;
import com.taskflow.projectservice.entity.Project;
import com.taskflow.projectservice.exception.ProjectNotFoundException;
import com.taskflow.projectservice.repository.ProjectRepository;
import com.taskflow.projectservice.service.ProjectService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProjectServiceImpl implements ProjectService {

    private final ProjectRepository projectRepository;

    @Override
    @Transactional
    public ProjectResponse createProject(CreateProjectRequest request) {
        log.info("Creating project with name: {}", request.getName());

        Project project = Project.builder()
                .name(request.getName())
                .description(request.getDescription())
                .status(request.getStatus())
                .ownerId(request.getOwnerId())
                .build();

        Project saved = projectRepository.save(project);
        log.info("Created project with id: {}", saved.getId());
        return mapToResponse(saved);
    }

    @Override
    public Page<ProjectResponse> getAllProjects(Pageable pageable) {
        log.info("Fetching projects page: {}, size: {}", pageable.getPageNumber(), pageable.getPageSize());
        return projectRepository.findAll(pageable).map(this::mapToResponse);
    }

    @Override
    public ProjectResponse getProjectById(Long id) {
        log.info("Fetching project with id: {}", id);
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ProjectNotFoundException(id));
        return mapToResponse(project);
    }

    @Override
    @Transactional
    public ProjectResponse updateProject(Long id, UpdateProjectRequest request) {
        log.info("Updating project with id: {}", id);
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ProjectNotFoundException(id));

        project.setName(request.getName());
        project.setDescription(request.getDescription());
        project.setStatus(request.getStatus());

        Project updated = projectRepository.save(project);
        log.info("Updated project with id: {}", updated.getId());
        return mapToResponse(updated);
    }

    @Override
    @Transactional
    public void deleteProject(Long id) {
        log.info("Deleting project with id: {}", id);
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ProjectNotFoundException(id));
        projectRepository.delete(project);
        log.info("Deleted project with id: {}", id);
    }

    @Override
    public List<ProjectResponse> searchProjects(String name) {
        log.info("Searching projects with name containing: {}", name);
        return projectRepository.findByNameContainingIgnoreCase(name).stream()
                .map(this::mapToResponse)
                .toList();
    }

    private ProjectResponse mapToResponse(Project project) {
        return ProjectResponse.builder()
                .id(project.getId())
                .name(project.getName())
                .description(project.getDescription())
                .status(project.getStatus())
                .ownerId(project.getOwnerId())
                .createdAt(project.getCreatedAt())
                .updatedAt(project.getUpdatedAt())
                .build();
    }
}
