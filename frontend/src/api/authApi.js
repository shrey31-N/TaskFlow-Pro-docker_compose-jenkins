import api from "./axios";

// All calls here go through the shared axios instance in ./axios, so they
// pick up the JWT header, the base URL resolution, and 401 handling for
// free. Paths are relative to "/api", matching the gateway's routes
// (Path=/api/users/**).

export const registerUser = async (userData) => {
    const response = await api.post("/users/register", userData);
    return response.data;
};

// Creates an Admin account directly - gated by the admin secret key on
// the backend (validated server-side against ADMIN_SECRET_KEY), not by
// anything in this UI. A wrong/missing key is rejected by the backend
// regardless of what gets submitted here.
export const registerAdmin = async (userData) => {
    const response = await api.post("/users/register-admin", userData);
    return response.data;
};

export const loginUser = async (credentials) => {
    const response = await api.post("/users/login", credentials);
    return response.data;
};

export const getProfile = async () => {
    const response = await api.get("/users/profile");
    return response.data;
};

export const updateProfile = async (userData) => {
    const response = await api.put("/users/profile", userData);
    return response.data;
};

export const changePassword = async (passwordData) => {
    const response = await api.post("/users/change-password", passwordData);
    return response.data;
};

export const uploadProfileImage = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await api.post("/users/profile-image", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });

    return response.data;
};

export const getUserById = async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
};

// Admin-only endpoints - the backend rejects these with a 403 for a
// non-admin caller regardless of what the UI shows.

export const getAllUsers = async () => {
    const response = await api.get("/users");
    return response.data;
};

export const promoteToAdmin = async (id) => {
    const response = await api.put(`/users/${id}/promote-to-admin`);
    return response.data;
};
