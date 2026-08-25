package com.taskflow.taskservice.exception;

/**
 * Thrown when a Member tries to change the status of a task that isn't
 * assigned to them. Admins never hit this - they can update any task.
 */
public class TaskAccessDeniedException extends RuntimeException {
    public TaskAccessDeniedException(String message) {
        super(message);
    }
}
