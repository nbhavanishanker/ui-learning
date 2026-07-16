import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
  Snackbar,
} from "@mui/material";
import { AppLayout } from "../components/AppLayout";
import { Markdown } from "../components/Markdown";
import { jsonKbToMarkdown } from "../lib/analyze";
import type { KB_ENTRIES } from "../lib/mock-data";

type Search = { service?: string };
type KbEntry = (typeof KB_ENTRIES)[number];

export const Route = createFileRoute("/doc-factory")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    service: typeof s.service === "string" ? s.service : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Doc Factory" },
      {
        name: "description",
        content:
          "Generate new knowledge base entries and browse existing service documentation.",
      },
    ],
  }),
  component: DocFactoryPage,
});

function DocFactoryPage() {
  const { service: prefill } = Route.useSearch();
  const [service, setService] = useState(prefill ?? "");
  const [gitRepo, setGitRepo] = useState("");
  const [configRepo, setConfigRepo] = useState("");
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState<{ markdown: string } | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const { data: kb, isLoading, refetch } = useQuery<KbEntry[]>({
    queryKey: ["kb"],
    queryFn: async () => {
      const r = await fetch("/api/kb");
      if (!r.ok) throw new Error("failed");
      return r.json();
    },
  });

  const [selectedService, setSelectedService] = useState<string>("");
  const selected = (kb ?? []).find((e) => e.service === selectedService) ?? kb?.[0];

  const handleGenerate = async () => {
    if (!service.trim() || !gitRepo.trim() || !configRepo.trim()) return;
    setGenerating(true);
    setGenerated(null);
    try {
      const r = await fetch("/api/kb", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          service: service.trim(),
          git_repo: gitRepo.trim(),
          config_repo: configRepo.trim(),
        }),
      });
      const data = (await r.json()) as { markdown: string };
      setGenerated(data);
      setToast("Knowledge base entry generated.");
      void refetch();
    } finally {
      setGenerating(false);
    }
  };

  return (
    <AppLayout>
      <Stack spacing={3}>
        <Box>
          <Typography variant="overline" color="primary.main">
            Knowledge
          </Typography>
          <Typography variant="h4">Knowledge Base Builder</Typography>
          <Typography variant="body2" color="text.secondary">
            Generate and review service runbooks for incident triage.
          </Typography>
        </Box>

        {/* Part A */}
        <Paper variant="outlined" sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 0.5 }}>
            Generate Knowledge Base
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Point the agent at a service's repositories to build a runbook draft.
          </Typography>
          <Stack spacing={2}>
            <TextField
              label="Service Name"
              value={service}
              onChange={(e) => setService(e.target.value)}
              fullWidth
            />
            <TextField
              label="Git Repo"
              placeholder="https://git.internal/team/service"
              value={gitRepo}
              onChange={(e) => setGitRepo(e.target.value)}
              fullWidth
            />
            <TextField
              label="Config Repo"
              placeholder="https://git.internal/config/service"
              value={configRepo}
              onChange={(e) => setConfigRepo(e.target.value)}
              fullWidth
            />
            <Box>
              <Button
                variant="contained"
                color="primary"
                onClick={handleGenerate}
                disabled={
                  generating || !service.trim() || !gitRepo.trim() || !configRepo.trim()
                }
                size="large"
              >
                {generating ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  "Generate Knowledge Base"
                )}
              </Button>
            </Box>
          </Stack>

          {generated && (
            <Box sx={{ mt: 3 }}>
              <Alert severity="success" sx={{ mb: 2 }}>
                Draft generated. Review below, then publish to your KB.
              </Alert>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Markdown source={generated.markdown} />
              </Paper>
            </Box>
          )}
        </Paper>

        {/* Part B */}
        <Paper variant="outlined" sx={{ p: 3 }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            sx={{ justifyContent: "space-between", alignItems: { sm: "center" }, mb: 2 }}
          >
            <Box>
              <Typography variant="h6">Existing Knowledge Base</Typography>
              <Typography variant="body2" color="text.secondary">
                Read API returns JSON, rendered here as Markdown.
              </Typography>
            </Box>
            {kb && kb.length > 0 && (
              <Select
                size="small"
                value={selected?.service ?? ""}
                onChange={(e) => setSelectedService(e.target.value)}
                sx={{ minWidth: 220 }}
              >
                {kb.map((e) => (
                  <MenuItem key={e.service} value={e.service}>
                    {e.service}
                  </MenuItem>
                ))}
              </Select>
            )}
          </Stack>
          <Divider sx={{ mb: 2 }} />
          {isLoading && <CircularProgress size={22} />}
          {selected && (
            <Box>
              <Typography variant="caption" color="text.secondary">
                Last updated {new Date(selected.updated_at).toLocaleString()}
              </Typography>
              <Markdown source={jsonKbToMarkdown(selected)} />
            </Box>
          )}
          {!isLoading && (!kb || kb.length === 0) && (
            <Typography variant="body2" color="text.secondary">
              No knowledge base entries yet.
            </Typography>
          )}
        </Paper>
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
