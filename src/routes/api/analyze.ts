import { createFileRoute } from "@tanstack/react-router";
import { analyzeIncident } from "../../lib/analyze";

export const Route = createFileRoute("/api/analyze")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json()) as {
          number?: string;
          context?: string;
          logs?: string;
          service?: string;
        };
        const result = analyzeIncident({
          number: body.number ?? "",
          context: body.context ?? "",
          logs: body.logs ?? "",
          service: body.service ?? "",
        });
        return Response.json(result);
      },
    },
  },
});
