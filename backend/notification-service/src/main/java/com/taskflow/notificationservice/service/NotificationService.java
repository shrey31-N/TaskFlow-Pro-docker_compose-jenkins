package com.taskflow.notificationservice.service;

import com.taskflow.notificationservice.dto.CreateNotificationRequest;
import com.taskflow.notificationservice.dto.NotificationResponse;

import java.util.List;

public interface NotificationService {

    NotificationResponse createNotification(CreateNotificationRequest request);

    NotificationResponse getNotificationById(Long id);

    List<NotificationResponse> getNotificationsByUser(Long userId);

    NotificationResponse markAsRead(Long id);

    void deleteNotification(Long id);

    long countUnreadByUser(Long userId);
}
