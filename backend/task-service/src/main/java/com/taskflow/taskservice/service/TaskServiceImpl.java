package com.taskflow.taskservice.service;

import com.taskflow.taskservice.client.NotificationServiceClient;
import com.taskflow.taskservice.client.UserServiceClient;
import com.taskflow.taskservice.dto.CreateTaskRequest;
import com.taskflow.taskservice.dto.NotificationRequest;
import com.taskflow.taskservice.dto.TaskResponse;
import com.taskflow.taskservice.dto.UpdateTaskRequest;
import com.taskflow.taskservice.dto.UserResponse;
import com.taskflow.taskservice.entity.Task;
import com.taskflow.taskservice.exception.ServiceUnavailableException;
import com.taskflow.taskservice.exception.TaskNotFoundException;
import com.taskflow.taskservice.repository.TaskRepository;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
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
public class TaskServiceImpl implements TaskService {

    private final TaskRepository taskRepository;
    private final UserServiceClient userServiceClient;
    private final NotificationServiceClient notificationServiceClient;

    @Override
    @Transactional
    public TaskResponse createTask(CreateTaskRequest request) {
        UserResponse user = getUserById(request.getAssignedUserId());
        if (user == null) {
            throw new RuntimeException("Assigned user not found with id: " + request.getAssignedUserId());
        }

        Task task = Task.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .status(request.getStatus())
                .priority(request.getPriority())
                .dueDate(request.getDueDate())
                .projectId(request.getProjectId())
                .assignedUserId(request.getAssignedUserId())
                .build();

        Task saved = taskRepository.save(task);

        sendTaskAssignedNotification(saved);

        return mapToResponse(saved);
    }

    @CircuitBreaker(name = "userService", fallbackMethod = "userServiceFallback")
    public UserResponse getUserById(Long userId) {
        return userServiceClient.getUserById(userId);
    }

    @SuppressWarnings("unused")
    private UserResponse userServiceFallback(Long userId, Throwable throwable) {
        log.error("User Service call failed for userId={}: {}", userId, throwable.getMessage());
        throw new ServiceUnavailableException("User Service is temporarily unavailable. Please try again later.");
    }

    private void sendTaskAssignedNotification(Task task) {
        try {
            NotificationRequest notificationRequest = NotificationRequest.builder()
                    .userId(task.getAssignedUserId())
                    .title("Task Assigned")
                    .message("A new task '" + task.getTitle() + "' has been assigned to you.")
                    .type("IN_APP")
                    .build();
            notificationServiceClient.createNotification(notificationRequest);
        } catch (Exception ex) {
            log.error("Failed to send task assignment notification for taskId={}: {}", task.getId(), ex.getMessage());
        }
    }

    @Override
    public List<TaskResponse> getAllTasks() {
        return taskRepository.findAll().stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public TaskResponse getTaskById(Long id) {
        Task task = findTaskOrThrow(id);
        return mapToResponse(task);
    }

    @Override
    @Transactional
    public TaskResponse updateTask(Long id, UpdateTaskRequest request) {
        Task task = findTaskOrThrow(id);

        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setStatus(request.getStatus());
        task.setPriority(request.getPriority());
        task.setDueDate(request.getDueDate());
        task.setProjectId(request.getProjectId());
        task.setAssignedUserId(request.getAssignedUserId());

        Task updated = taskRepository.save(task);
        return mapToResponse(updated);
    }

    @Override
    @Transactional
    public void deleteTask(Long id) {
        Task task = findTaskOrThrow(id);
        taskRepository.delete(task);
    }

    @Override
    public List<TaskResponse> getTasksByProject(Long projectId) {
        return taskRepository.findByProjectId(projectId).stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public List<TaskResponse> getTasksByAssignedUser(Long userId) {
        return taskRepository.findByAssignedUserId(userId).stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public Page<TaskResponse> getAllTasks(Pageable pageable) {
        return taskRepository.findAll(pageable).map(this::mapToResponse);
    }

    @Override
    public List<TaskResponse> searchTasks(String keyword) {
        return taskRepository.findByTitleContainingIgnoreCase(keyword).stream()
                .map(this::mapToResponse)
                .toList();
    }

    private Task findTaskOrThrow(Long id) {
        return taskRepository.findById(id)
                .orElseThrow(() -> new TaskNotFoundException("Task not found with id: " + id));
    }

    private TaskResponse mapToResponse(Task task) {
        return TaskResponse.builder()
                .id(task.getId())
                .title(task.getTitle())
                .description(task.getDescription())
                .status(task.getStatus().name())
                .priority(task.getPriority().name())
                .dueDate(task.getDueDate())
                .projectId(task.getProjectId())
                .assignedUserId(task.getAssignedUserId())
                .createdAt(task.getCreatedAt())
                .updatedAt(task.getUpdatedAt())
                .build();
    }
}
