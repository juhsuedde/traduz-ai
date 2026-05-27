import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
  vite: {
    server: {
      port: 3456,
      strictPort: true,
    },
  },
  nitro: {
    preset: "vercel",
    output: {
      publicDir: "dist/static",
      serverDir: "dist/functions/__server.func",
    },
  },
});
