import { type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  AppBar,
  Box,
  Container,
  Toolbar,
  Typography,
  Button,
  Stack,
  Divider,
} from "@mui/material";

const NAV = [
  { to: "/", label: "Incident Overview" },
  { to: "/triage", label: "Triage" },
  { to: "/doc-factory", label: "Knowledge Base" },
] as const;

export function AppLayout({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column", bgcolor: "background.default" }}>
      {/* Top brand bar - HSBC-inspired red */}
      <Box sx={{ bgcolor: "primary.main", color: "primary.contrastText" }}>
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ minHeight: 64, gap: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 300, letterSpacing: 0.5 }}>
              SRE Ops Console
            </Typography>
            <Box sx={{ flex: 1 }} />
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Incident Triage Workspace
            </Typography>
          </Toolbar>
        </Container>
      </Box>

      {/* Secondary nav bar - white with underline active state */}
      <AppBar
        position="sticky"
        color="inherit"
        sx={{
          bgcolor: "background.paper",
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ minHeight: 56, gap: 1 }}>
            <Stack direction="row" spacing={0}>
              {NAV.map((item) => {
                const active =
                  item.to === "/"
                    ? pathname === "/"
                    : pathname.startsWith(item.to);
                return (
                  <Button
                    key={item.to}
                    component={Link}
                    to={item.to}
                    sx={{
                      color: "text.primary",
                      px: 2.5,
                      py: 2,
                      borderRadius: 0,
                      borderBottom: "3px solid",
                      borderColor: active ? "primary.main" : "transparent",
                      "&:hover": { bgcolor: "rgba(0,0,0,0.03)" },
                    }}
                  >
                    {item.label}
                  </Button>
                );
              })}
            </Stack>
          </Toolbar>
        </Container>
      </AppBar>

      <Box component="main" sx={{ flex: 1, py: 4 }}>
        <Container maxWidth="xl">{children}</Container>
      </Box>

      {/* Footer - dark, HSBC-inspired */}
      <Box component="footer" sx={{ bgcolor: "#1c1c1c", color: "rgba(255,255,255,0.85)", mt: 6 }}>
        <Container maxWidth="xl" sx={{ py: 5 }}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={4}
            sx={{ justifyContent: "space-between" }}
          >
            <Box>
              <Typography variant="subtitle1" sx={{ color: "#fff", fontWeight: 500 }}>
                SRE Ops Console
              </Typography>
              <Typography variant="body2" sx={{ mt: 1, maxWidth: 420, opacity: 0.7 }}>
                Triage incidents, capture context, and generate knowledge base drafts for faster follow-up.
              </Typography>
            </Box>
            <Stack direction="row" spacing={4}>
              <Stack spacing={1}>
                <Typography variant="overline" sx={{ opacity: 0.6 }}>Product</Typography>
                <FooterLink to="/">Overview</FooterLink>
                <FooterLink to="/triage">Triage</FooterLink>
                <FooterLink to="/doc-factory">Doc Factory</FooterLink>
              </Stack>
              <Stack spacing={1}>
                <Typography variant="overline" sx={{ opacity: 0.6 }}>Support</Typography>
                <FooterLink to="/">Runbooks</FooterLink>
                <FooterLink to="/">Contact SRE</FooterLink>
              </Stack>
            </Stack>
          </Stack>
          <Divider sx={{ my: 3, borderColor: "rgba(255,255,255,0.12)" }} />
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1}
            sx={{ justifyContent: "space-between" }}
          >
            <Typography variant="caption" sx={{ opacity: 0.6 }}>
              © {new Date().getFullYear()} SRE Ops Console. Demo use only.
            </Typography>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
}

function FooterLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link
      to={to}
      style={{
        color: "rgba(255,255,255,0.85)",
        textDecoration: "none",
        fontSize: 14,
      }}
    >
      {children}
    </Link>
  );
}
