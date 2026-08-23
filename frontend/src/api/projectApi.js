import api from "./axios";

// Paths are relative to "/api", matching the gateway's routes
// (Path=/api/projects/**).

export const getProjects = async (page = 0, size = 5) => {
    const response = await api.get("/projects", {
        params: { page, size },
    });
    return response.data;
};

export const getProjectById = async (id) => {
    const response = await api.get(`/projects/${id}`);
    return response.data;
};

export const createProject = async (projectData) => {
    const response = await api.post("/projects", projectData);
    return response.data;
};

export const updateProject = async (id, projectData) => {
    const response = await api.put(`/projects/${id}`, projectData);
    return response.data;
};

export const deleteProject = async (id) => {
    const response = await api.delete(`/projects/${id}`);
    return response.data;
};

export const searchProjects = async (name) => {
    const response = await api.get("/projects/search", {
        params: { name },
    });
    return response.data;
};
