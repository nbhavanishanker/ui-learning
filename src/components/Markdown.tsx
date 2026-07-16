import { Box } from "@mui/material";
import { renderMarkdown } from "../lib/markdown";

export function Markdown({ source }: { source: string }) {
  return (
    <Box
      sx={{
        "& h1": { fontSize: 24, fontWeight: 500, mt: 2, mb: 1 },
        "& h2": { fontSize: 20, fontWeight: 500, mt: 2, mb: 1 },
        "& h3": { fontSize: 17, fontWeight: 500, mt: 1.5, mb: 0.5 },
        "& p": { my: 1, lineHeight: 1.6, color: "text.primary" },
        "& ul, & ol": { pl: 3, my: 1 },
        "& li": { my: 0.25 },
        "& code": {
          bgcolor: "#f2f2f2",
          px: 0.5,
          py: 0.25,
          borderRadius: 0.5,
          fontSize: 13,
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
        },
        "& pre": {
          bgcolor: "#1c1c1c",
          color: "#f6f6f6",
          p: 2,
          borderRadius: 1,
          overflowX: "auto",
          fontSize: 13,
        },
        "& pre code": { bgcolor: "transparent", color: "inherit", p: 0 },
        "& hr": { border: 0, borderTop: 1, borderColor: "divider", my: 2 },
        "& a": { color: "primary.main" },
      }}
      dangerouslySetInnerHTML={{ __html: renderMarkdown(source) }}
    />
  );
}
