import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), "");

    // Where the dev server proxies "/api" to. Defaults to the local
    // gateway (e.g. via docker-compose); set VITE_API_PROXY_TARGET in
    // frontend/.env.local to point at the deployed ALB instead.
    const proxyTarget =
        env.VITE_API_PROXY_TARGET || "http://localhost:8080";

    return {
        plugins: [react()],

        server: {
            port: 5173,

            proxy: {
                "/api": {
                    target: proxyTarget,
                    changeOrigin: true,
                    secure: false,
                },
            },
        },
    };
});
