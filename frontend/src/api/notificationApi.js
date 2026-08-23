import api from "./axios";

// Paths are relative to "/api", matching the gateway's routes
// (Path=/api/notifications/**).

export const getNotificationsByUser = async (userId) => {
    const response = await api.get(`/notifications/user/${userId}`);
    return response.data;
};

export const getUnreadCount = async (userId) => {
    const response = await api.get(`/notifications/user/${userId}/unread-count`);
    return response.data;
};

export const markAsRead = async (id) => {
    const response = await api.put(`/notifications/${id}/read`);
    return response.data;
};

export const deleteNotification = async (id) => {
    const response = await api.delete(`/notifications/${id}`);
    return response.data;
};
