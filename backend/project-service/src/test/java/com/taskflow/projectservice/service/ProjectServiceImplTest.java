package com.taskflow.projectservice.service;

import com.taskflow.projectservice.dto.CreateProjectRequest;
import com.taskflow.projectservice.dto.ProjectResponse;
import com.taskflow.projectservice.dto.UpdateProjectRequest;
import com.taskflow.projectservice.entity.Project;
import com.taskflow.projectservice.entity.ProjectStatus;
import com.taskflow.projectservice.exception.ProjectNotFoundException;
import com.taskflow.projectservice.repository.ProjectRepository;
import com.taskflow.projectservice.service.impl.ProjectServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ProjectServiceImplTest {

    @Mock
    private ProjectRepository projectRepository;

    @InjectMocks
    private ProjectServiceImpl projectService;

    private Project project;

    @BeforeEach
    void setUp() {
        project = Project.builder()
                .id(1L)
                .name("Test Project")
                .description("Test Description")
                .status(ProjectStatus.ACTIVE)
                .ownerId(100L)
                .build();
    }

    @Test
    void createProject_shouldReturnSavedProject() {
        CreateProjectRequest request = new CreateProjectRequest(
                "Test Project", "Test Description", ProjectStatus.ACTIVE, 100L);
        when(projectRepository.save(any(Project.class))).thenReturn(project);

        ProjectResponse response = projectService.createProject(request);

        assertThat(response.getId()).isEqualTo(1L);
        assertThat(response.getName()).isEqualTo("Test Project");
        verify(projectRepository, times(1)).save(any(Project.class));
    }

    @Test
    void getProjectById_shouldReturnProject_whenExists() {
        when(projectRepository.findById(1L)).thenReturn(Optional.of(project));

        ProjectResponse response = projectService.getProjectById(1L);

        assertThat(response.getId()).isEqualTo(1L);
    }

    @Test
    void getProjectById_shouldThrow_whenNotFound() {
        when(projectRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> projectService.getProjectById(99L))
                .isInstanceOf(ProjectNotFoundException.class);
    }

    @Test
    void getAllProjects_shouldReturnPagedResponse() {
        Pageable pageable = PageRequest.of(0, 5);
        when(projectRepository.findAll(pageable)).thenReturn(new PageImpl<>(List.of(project)));

        var page = projectService.getAllProjects(pageable);

        assertThat(page.getContent()).hasSize(1);
    }

    @Test
    void updateProject_shouldUpdateFields() {
        UpdateProjectRequest request = new UpdateProjectRequest(
                "Updated Name", "Updated Desc", ProjectStatus.COMPLETED);
        when(projectRepository.findById(1L)).thenReturn(Optional.of(project));
        when(projectRepository.save(any(Project.class))).thenReturn(project);

        ProjectResponse response = projectService.updateProject(1L, request);

        assertThat(response).isNotNull();
        verify(projectRepository).save(any(Project.class));
    }

    @Test
    void deleteProject_shouldDelete_whenExists() {
        when(projectRepository.findById(1L)).thenReturn(Optional.of(project));

        projectService.deleteProject(1L);

        verify(projectRepository, times(1)).delete(project);
    }

    @Test
    void searchProjects_shouldReturnMatches() {
        when(projectRepository.findByNameContainingIgnoreCase("test")).thenReturn(List.of(project));

        List<ProjectResponse> results = projectService.searchProjects("test");

        assertThat(results).hasSize(1);
    }
}
