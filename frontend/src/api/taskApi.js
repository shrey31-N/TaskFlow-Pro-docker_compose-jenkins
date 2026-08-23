import api from "./axios";

// Paths are relative to "/api", matching the gateway's routes
// (Path=/api/tasks/**).

export const getTasks = async () => {
    const response = await api.get("/tasks");
    return response.data;
};

export const getTaskById = async (id) => {
    const response = await api.get(`/tasks/${id}`);
    return response.data;
};

export const createTask = async (taskData) => {
    const response = await api.post("/tasks", taskData);
    return response.data;
};

export const updateTask = async (id, taskData) => {
    const response = await api.put(`/tasks/${id}`, taskData);
    return response.data;
};

export const deleteTask = async (id) => {
    const response = await api.delete(`/tasks/${id}`);
    return response.data;
};

export const getTasksByProject = async (projectId) => {
    const response = await api.get(`/tasks/project/${projectId}`);
    return response.data;
};

export const getTasksByUser = async (userId) => {
    const response = await api.get(`/tasks/user/${userId}`);
    return response.data;
};

export const getTasksPaginated = async (page = 0, size = 10, sortBy = "id") => {
    const response = await api.get("/tasks/page", {
        params: { page, size, sortBy },
    });
    return response.data;
};

export const searchTasks = async (keyword) => {
    const response = await api.get("/tasks/search", {
        params: { keyword },
    });
    return response.data;
};
