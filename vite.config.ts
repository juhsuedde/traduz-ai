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
    plugins: [
      {
        name: "favicon-dev",
        apply: "serve",
        configureServer(server) {
          server.middlewares.use("/favicon.ico", (_req, res) => {
            res.statusCode = 204;
            res.end();
          });
        },
      },
      {
        name: "chat-stream-dev",
        apply: "serve",
        configureServer(server) {
          server.middlewares.use("/api/chat-stream", async (req, res, next) => {
            if (req.method !== "POST") return next();

            try {
              const mod = await server.ssrLoadModule(
                "/src/lib/api/chat-stream-handler.ts",
              );
              const { createChatStream } = mod;

              const buffers: Buffer[] = [];
              for await (const chunk of req) buffers.push(chunk);
              const body = JSON.parse(Buffer.concat(buffers).toString());

              const cookies = Object.fromEntries(
                (req.headers.cookie || "")
                  .split(";")
                  .filter(Boolean)
                  .map((c) => {
                    const [k, ...v] = c.trim().split("=");
                    return [k, v.join("=")];
                  }),
              );

              const readable = await createChatStream({
                ...body,
                sessionId: cookies.auth_session,
              });

              res.setHeader("Content-Type", "text/event-stream");
              res.setHeader("Cache-Control", "no-cache");
              res.setHeader("Connection", "keep-alive");
              res.writeHead(200);

              const reader = readable.getReader();
              const pump = () => {
                reader
                  .read()
                  .then(({ done, value }) => {
                    if (done) {
                      res.end();
                      return;
                    }
                    res.write(value);
                    pump();
                  })
                  .catch(() => res.end());
              };
              pump();
            } catch (err) {
              console.error("[chat-stream-dev] Error:", err);
              res.statusCode = 500;
              res.end("Internal Server Error");
            }
          });
        },
      },
    ],
  },
  nitro: {
    preset: "vercel",
    handlers: [
      {
        route: "/api/chat-stream",
        handler: "src/routes/api/chat-stream.ts",
        method: "post",
      },
    ],
    output: {
      dir: ".vercel/output",
      publicDir: ".vercel/output/static",
      serverDir: ".vercel/output/functions/__server.func",
    },
  },
});
