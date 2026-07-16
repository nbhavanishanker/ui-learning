import { createFileRoute } from "@tanstack/react-router";
import { INCIDENTS } from "../../lib/mock-data";
import { fetchIncident } from "../../lib/analyze";

export const Route = createFileRoute("/api/incidents")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const number = url.searchParams.get("number");
        if (number) {
          const inc = fetchIncident(number);
          if (!inc) return new Response("Not found", { status: 404 });
          return Response.json(inc);
        }
        return Response.json(INCIDENTS);
      },
    },
  },
});
