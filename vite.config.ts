import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";
import UnoCSS from "@unocss/svelte-scoped/vite";

const host = process.env.TAURI_DEV_HOST;

export default defineConfig(async () => ({
    plugins: [UnoCSS(), sveltekit()],
    clearScreen: false,
    server: {
        port: 1420,
        strictPort: true,
        host: host || false,
        hmr: host
            ? {
                  protocol: "ws",
                  host,
                  port: 1421,
              }
            : undefined,
        watch: {
            ignored: ["**/src-tauri/**"],
        },
    },
}));
