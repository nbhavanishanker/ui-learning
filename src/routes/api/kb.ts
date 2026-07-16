import { createFileRoute } from "@tanstack/react-router";
import { getKbEntries, generateKbMarkdown } from "../../lib/analyze";

export const Route = createFileRoute("/api/kb")({
  server: {
    handlers: {
      GET: async () => Response.json(getKbEntries()),
      POST: async ({ request }) => {
        const body = (await request.json()) as {
          service?: string;
          git_repo?: string;
          config_repo?: string;
        };
        if (!body.service || !body.git_repo || !body.config_repo) {
          return new Response("Missing fields", { status: 400 });
        }
        return Response.json(
          generateKbMarkdown({
            service: body.service,
            git_repo: body.git_repo,
            config_repo: body.config_repo,
          }),
        );
      },
    },
  },
});
