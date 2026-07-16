import { createTheme } from "@mui/material/styles";

// HSBC-inspired palette: signature red, white surfaces, dark text.
export const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#db0011", dark: "#a80010", light: "#ff4a3d", contrastText: "#ffffff" },
    secondary: { main: "#333333" },
    background: { default: "#f6f6f6", paper: "#ffffff" },
    text: { primary: "#1c1c1c", secondary: "#4a4a4a" },
    divider: "#e0e0e0",
  },
  typography: {
    fontFamily:
      '"Univers Next", "Helvetica Neue", Helvetica, Arial, system-ui, -apple-system, sans-serif',
    h1: { fontWeight: 300 },
    h2: { fontWeight: 300 },
    h3: { fontWeight: 400 },
    h4: { fontWeight: 400 },
    h5: { fontWeight: 500 },
    h6: { fontWeight: 500 },
    button: { textTransform: "none", fontWeight: 500 },
  },
  shape: { borderRadius: 2 },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: { root: { borderRadius: 2 } },
    },
    MuiPaper: {
      styleOverrides: { root: { backgroundImage: "none" } },
    },
    MuiAppBar: {
      styleOverrides: { root: { boxShadow: "none" } },
    },
  },
});
