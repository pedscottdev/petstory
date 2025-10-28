import { defineConfig } from "vite";
import laravel from "laravel-vite-plugin";
import react from '@vitejs/plugin-react'
import tailwindcss from "@tailwindcss/vite";
import path from "path";


export default defineConfig({
    plugins: [
        laravel({
            input: ["resources/js/main.jsx"],
            refresh: true,
        }),
        tailwindcss(),
        react(),
    ],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./resources/js"),
        },
    },
});
