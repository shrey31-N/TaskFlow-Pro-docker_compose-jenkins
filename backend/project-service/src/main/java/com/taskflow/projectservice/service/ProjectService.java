package com.taskflow.projectservice.service;

import com.taskflow.projectservice.dto.CreateProjectRequest;
import com.taskflow.projectservice.dto.ProjectResponse;
import com.taskflow.projectservice.dto.UpdateProjectRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ProjectService {

    ProjectResponse createProject(CreateProjectRequest request);

    Page<ProjectResponse> getAllProjects(Pageable pageable);

    ProjectResponse getProjectById(Long id);

    ProjectResponse updateProject(Long id, UpdateProjectRequest request);

    void deleteProject(Long id);

    List<ProjectResponse> searchProjects(String name);
}
