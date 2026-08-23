package com.taskflow.notificationservice.dto;

/**
 * Small response body backing GET /api/notifications/user/{userId}/unread-count,
 * so the frontend can show an unread badge without fetching the whole notification list.
 */
public record UnreadCountResponse(Long count) {
}
