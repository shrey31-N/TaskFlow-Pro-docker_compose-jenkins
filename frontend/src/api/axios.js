import axios from "axios";

// Base URL resolution:
// - In dev, requests to "/api" are proxied by Vite (see vite.config.js) to
//   whatever VITE_API_PROXY_TARGET points at (local gateway or the ALB).
// - In a production build, set VITE_API_BASE_URL at build time to the
//   gateway/ALB URL directly. If left unset, requests stay relative ("/api"),
//   which works as long as whatever serves the built app also forwards
//   /api/** to the gateway.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// Automatically attach JWT token when available.
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// If the backend says the token is invalid/expired, clear it out and bounce
// back to the login page (unless we're already there).
api.interceptors.response.use(
    (response) => response,

    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");

            if (window.location.pathname !== "/") {
                window.location.href = "/";
            }
        }

        return Promise.reject(error);
    }
);

export default api;
