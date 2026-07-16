import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Box,
  Paper,
  Stack,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  Skeleton,
} from "@mui/material";
import { AppLayout } from "../components/AppLayout";
import type { Incident } from "../lib/mock-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "INs Overview" },
      {
        name: "description",
        content:
          "Overview of active incidents (INs) across services, with priority, status, and owner.",
      },
    ],
  }),
  component: OverviewPage,
});

function priorityColor(p: Incident["priority"]) {
  switch (p) {
    case "P1":
      return "error" as const;
    case "P2":
      return "warning" as const;
    case "P3":
      return "info" as const;
    default:
      return "default" as const;
  }
}

function statusColor(s: Incident["status"]) {
  switch (s) {
    case "New":
      return "info" as const;
    case "In Progress":
      return "warning" as const;
    case "On Hold":
      return "default" as const;
    case "Resolved":
      return "success" as const;
  }
}

function OverviewPage() {
  const { data, isLoading } = useQuery<Incident[]>({
    queryKey: ["incidents"],
    queryFn: async () => {
      const r = await fetch("/api/incidents");
      if (!r.ok) throw new Error("Failed to load");
      return r.json();
    },
  });

  const open = (data ?? []).filter((i) => i.status !== "Resolved").length;
  const p1 = (data ?? []).filter((i) => i.priority === "P1").length;
  const inProgress = (data ?? []).filter((i) => i.status === "In Progress").length;

  return (
    <AppLayout>
      <Stack spacing={3}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          sx={{ alignItems: { sm: "flex-end" }, justifyContent: "space-between" }}
        >
          <Box>
            <Typography variant="overline" color="primary.main">
              Dashboard
            </Typography>
            <Typography variant="h4">Incident Overview</Typography>
            <Typography variant="body2" color="text.secondary">
              Live view of open incidents across the estate.
            </Typography>
          </Box>
          <Button
            component={Link}
            to="/triage"
            variant="contained"
            color="primary"
            size="large"
          >
            Triage an Incident
          </Button>
        </Stack>

        <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
          <StatCard label="Open Incidents" value={open} tone="default" />
          <StatCard label="P1 Incidents" value={p1} tone="error" />
          <StatCard label="In Progress" value={inProgress} tone="warning" />
          <StatCard label="Total (7d)" value={(data ?? []).length} tone="default" />
        </Stack>

        <Paper variant="outlined">
          <Box sx={{ px: 3, py: 2, borderBottom: 1, borderColor: "divider" }}>
            <Typography variant="h6">Active Incidents</Typography>
          </Box>
          <TableContainer>
            <Table size="medium">
              <TableHead>
                <TableRow sx={{ "& th": { fontWeight: 600, color: "text.secondary" } }}>
                  <TableCell>Number</TableCell>
                  <TableCell>Short Description</TableCell>
                  <TableCell>Service</TableCell>
                  <TableCell>Priority</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Assignee</TableCell>
                  <TableCell>Opened</TableCell>
                  <TableCell align="right">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading &&
                  Array.from({ length: 4 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 8 }).map((__, j) => (
                        <TableCell key={j}>
                          <Skeleton />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                {(data ?? []).map((inc) => (
                  <TableRow key={inc.number} hover>
                    <TableCell sx={{ fontFamily: "ui-monospace, monospace" }}>
                      {inc.number}
                    </TableCell>
                    <TableCell>{inc.short_description}</TableCell>
                    <TableCell>
                      <code>{inc.service}</code>
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={inc.priority}
                        color={priorityColor(inc.priority)}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={inc.status}
                        color={statusColor(inc.status)}
                        variant={inc.status === "Resolved" ? "filled" : "outlined"}
                      />
                    </TableCell>
                    <TableCell>{inc.assignee}</TableCell>
                    <TableCell sx={{ color: "text.secondary" }}>
                      {new Date(inc.opened_at).toLocaleString()}
                    </TableCell>
                    <TableCell align="right">
                      <Button
                        component={Link}
                        to="/triage"
                        search={{ number: inc.number } as never}
                        size="small"
                        variant="outlined"
                      >
                        Triage
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Stack>
    </AppLayout>
  );
}

function StatCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "default" | "error" | "warning";
}) {
  const borderColor =
    tone === "error" ? "error.main" : tone === "warning" ? "warning.main" : "divider";
  return (
    <Paper variant="outlined" sx={{ p: 2.5, flex: 1, borderLeft: 4, borderLeftColor: borderColor }}>
      <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase" }}>
        {label}
      </Typography>
      <Typography variant="h4" sx={{ mt: 0.5 }}>
        {value}
      </Typography>
    </Paper>
  );
}
