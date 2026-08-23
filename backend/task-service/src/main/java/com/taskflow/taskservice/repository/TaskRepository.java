package com.taskflow.taskservice.repository;

import com.taskflow.taskservice.entity.Task;
import com.taskflow.taskservice.entity.TaskStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Long> {

    List<Task> findByProjectId(Long projectId);

    List<Task> findByAssignedUserId(Long assignedUserId);

    List<Task> findByStatus(TaskStatus status);

    List<Task> findByTitleContainingIgnoreCase(String keyword);
}
