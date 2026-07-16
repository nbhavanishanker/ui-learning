import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Chip,
  CircularProgress,
  Paper,
  Stack,
  TextField,
  Typography,
  Snackbar,
  Divider,
} from "@mui/material";
import { AppLayout } from "../components/AppLayout";
import { Markdown } from "../components/Markdown";
import type { AnalyzeResponse } from "../lib/analyze";
import type { Incident } from "../lib/mock-data";

type Search = { number?: string };

export const Route = createFileRoute("/triage")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    number: typeof s.number === "string" ? s.number : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Triage IN" },
      {
        name: "description",
        content:
          "Fetch an IN from ServiceNow, review context and logs, and propose a solution.",
      },
    ],
  }),
  component: TriagePage,
});

function TriagePage() {
  const search = Route.useSearch();
  const navigate = useNavigate();

  const [number, setNumber] = useState(search.number ?? "");
  const [context, setContext] = useState("");
  const [logs, setLogs] = useState("");
  const [service, setService] = useState("");
  const [fetching, setFetching] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalyzeResponse | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (search.number && !context) {
      void handleFetch(search.number);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFetch = async (n?: string) => {
    const num = (n ?? number).trim();
    if (!num) return;
    setFetching(true);
    setFetchError(null);
    setResult(null);
    try {
      const r = await fetch(`/api/incidents?number=${encodeURIComponent(num)}`);
      if (r.status === 404) {
        setFetchError(`IN ${num} not found in ServiceNow.`);
        return;
      }
      if (!r.ok) throw new Error("fetch failed");
      const inc = (await r.json()) as Incident;
      setNumber(inc.number);
      setContext(inc.context);
      setLogs(inc.logs);
      setService(inc.service);
    } catch {
      setFetchError("Could not reach ServiceNow. Try again.");
    } finally {
      setFetching(false);
    }
  };

  const handleAnalyze = async () => {
    setAnalyzing(true);
    setResult(null);
    try {
      const r = await fetch("/api/analyze", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ number, context, logs, service }),
      });
      const data = (await r.json()) as AnalyzeResponse;
      setResult(data);
    } finally {
      setAnalyzing(false);
    }
  };

  const pushToConfluence = () => setToast("Draft note prepared for sharing.");
  const copyMarkdown = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result.markdown);
    setToast("Markdown copied to clipboard.");
  };

  return (
    <AppLayout>
      <Stack spacing={3}>
        <Box>
          <Typography variant="overline" color="primary.main">
            Workflow
          </Typography>
          <Typography variant="h4">Incident Triage</Typography>
          <Typography variant="body2" color="text.secondary">
            Pull an incident record from your system, review context, and propose a solution.
          </Typography>
        </Box>

        {/* Step 1: fetch */}
        <Paper variant="outlined" sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            1. Ticket Selection
          </Typography>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              label="IN Number"
              placeholder="e.g. IN0012045"
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              sx={{ flex: 1 }}
              size="medium"
            />
            <Button
              variant="contained"
              color="primary"
              onClick={() => handleFetch()}
              disabled={fetching || !number.trim()}
              sx={{ minWidth: 180 }}
            >
              {fetching ? <CircularProgress size={20} color="inherit" /> : "Fetch Details"}
            </Button>
          </Stack>
          {fetchError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {fetchError}
            </Alert>
          )}
        </Paper>

        {/* Step 2: inputs */}
        <Paper variant="outlined" sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            2. Analysis Input
          </Typography>
          <Stack spacing={2}>
            <TextField
              label="Context of the IN"
              value={context}
              onChange={(e) => setContext(e.target.value)}
              multiline
              minRows={3}
              fullWidth
            />
            <TextField
              label="Logs"
              value={logs}
              onChange={(e) => setLogs(e.target.value)}
              multiline
              minRows={5}
              fullWidth
              slotProps={{
                input: {
                  sx: { fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: 13 },
                },
              }}
            />
            <TextField
              label="Service Name"
              value={service}
              onChange={(e) => setService(e.target.value)}
              fullWidth
            />
          </Stack>
        </Paper>

        {/* Step 3: analyze */}
        <Paper variant="outlined" sx={{ p: 3 }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            sx={{ justifyContent: "space-between", alignItems: { sm: "center" } }}
          >
            <Box>
              <Typography variant="h6">3. Triage Action</Typography>
              <Typography variant="body2" color="text.secondary">
                Runs the analysis against the available knowledge base.
              </Typography>
            </Box>
            <Button
              size="large"
              variant="contained"
              color="primary"
              onClick={handleAnalyze}
              disabled={analyzing || !service.trim()}
              sx={{ minWidth: 260, py: 1.5 }}
            >
              {analyzing ? (
                <CircularProgress size={22} color="inherit" />
              ) : (
                "Analyze and Propose Solution"
              )}
            </Button>
          </Stack>
        </Paper>

        {/* Result */}
        {result && !result.found && (
          <Alert
            severity="warning"
            action={
              <Button
                color="inherit"
                size="small"
                onClick={() =>
                  navigate({
                    to: "/doc-factory",
                    search: { service } as never,
                  })
                }
              >
                Open Doc Factory
              </Button>
            }
          >
            <AlertTitle>Service is not available in knowledge base</AlertTitle>
            No runbook exists for <code>{service}</code>. Generate one in the knowledge base
            builder before re-running triage.
          </Alert>
        )}

        {result && result.found && (
          <Paper variant="outlined" sx={{ p: 3 }}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1}
              sx={{ justifyContent: "space-between", alignItems: { sm: "center" }, mb: 2 }}
            >
              <Box>
                <Typography variant="h6">Proposed Solution</Typography>
                <Typography variant="body2" color="text.secondary">
                  Markdown output from the analysis workflow.
                </Typography>
              </Box>
              <Stack direction="row" spacing={1}>
                <Button variant="outlined" onClick={copyMarkdown}>
                  Copy Markdown
                </Button>
                <Button variant="contained" color="primary" onClick={pushToConfluence}>
                  Publish Draft
                </Button>
              </Stack>
            </Stack>
            <Divider sx={{ mb: 2 }} />
            <Markdown source={result.markdown} />
          </Paper>
        )}

        {result && (
          <Paper
            variant="outlined"
            sx={{ p: 3, borderColor: "warning.main", borderWidth: 1 }}
          >
            <Alert severity="warning" sx={{ mb: 2 }}>
              <AlertTitle>One of these changes may have caused this issue.</AlertTitle>
              Change requests deployed in the last 7 days for <code>{service}</code>.
            </Alert>

            {result.changes.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No change requests were deployed against this service in the last 7 days.
              </Typography>
            ) : (
              <Stack spacing={1.5}>
                {result.changes.map((c) => (
                  <Paper
                    key={c.number}
                    variant="outlined"
                    sx={{ p: 2, display: "flex", gap: 2, alignItems: "center" }}
                  >
                    <Box sx={{ minWidth: 120, fontFamily: "ui-monospace, monospace" }}>
                      {c.number}
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {c.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {c.owner} · deployed {new Date(c.deployed_at).toLocaleString()}
                      </Typography>
                    </Box>
                    <Chip
                      label={`${c.risk} risk`}
                      size="small"
                      color={
                        c.risk === "High"
                          ? "error"
                          : c.risk === "Medium"
                            ? "warning"
                            : "default"
                      }
                    />
                  </Paper>
                ))}
              </Stack>
            )}
          </Paper>
        )}

        <Box>
          <Button component={Link} to="/" variant="text">
            ← Back to overview
          </Button>
        </Box>
      </Stack>

      <Snackbar
        open={!!toast}
        autoHideDuration={2500}
        onClose={() => setToast(null)}
        message={toast ?? ""}
      />
    </AppLayout>
  );
}
