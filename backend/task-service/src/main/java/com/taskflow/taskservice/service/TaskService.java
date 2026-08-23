package com.taskflow.taskservice.service;

import com.taskflow.taskservice.dto.CreateTaskRequest;
import com.taskflow.taskservice.dto.TaskResponse;
import com.taskflow.taskservice.dto.UpdateTaskRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface TaskService {

    TaskResponse createTask(CreateTaskRequest request);

    List<TaskResponse> getAllTasks();

    TaskResponse getTaskById(Long id);

    TaskResponse updateTask(Long id, UpdateTaskRequest request);

    void deleteTask(Long id);

    List<TaskResponse> getTasksByProject(Long projectId);

    List<TaskResponse> getTasksByAssignedUser(Long userId);

    Page<TaskResponse> getAllTasks(Pageable pageable);

    List<TaskResponse> searchTasks(String keyword);
}
