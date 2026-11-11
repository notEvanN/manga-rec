import { createTheme } from "@mui/material/styles";

// Design system for the app, built on MUI (https://mui.com/material-ui/).
// Change colors, fonts, spacing and component defaults here, not in individual components.
// In components, use theme values (e.g. color="text.secondary", sx={{ p: 2 }}) instead of raw CSS.

const fontFamily =
  'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

export const theme = createTheme({
  // Light and dark palettes. The user's choice is saved and applied by ThemeProvider (see main.jsx).
  cssVariables: { colorSchemeSelector: "data" },
  colorSchemes: {
    light: {
      palette: {
        primary: { main: "#6d28d9" },
        secondary: { main: "#d97706" }, // ratings / stars
        background: { default: "#f7f6fb", paper: "#ffffff" },
      },
    },
    dark: {
      palette: {
        primary: { main: "#a78bfa" },
        secondary: { main: "#fbbf24" },
        background: { default: "#121017", paper: "#1c1a23" },
      },
    },
  },

  shape: { borderRadius: 10 },

  typography: {
    fontFamily,
    h1: { fontSize: "1.375rem", fontWeight: 800, letterSpacing: "-0.01em" },
    h2: { fontSize: "1.5rem", fontWeight: 700 },
    h3: { fontSize: "1.25rem", fontWeight: 700 },
    button: { textTransform: "none", fontWeight: 600 },
  },

  components: {
    MuiAppBar: {
      defaultProps: { elevation: 0, color: "inherit", position: "sticky" },
      styleOverrides: {
        root: ({ theme }) => ({ borderBottom: `1px solid ${theme.vars.palette.divider}` }),
      },
    },
    MuiButton: { defaultProps: { disableElevation: true } },
    MuiCard: { defaultProps: { variant: "outlined" } },
    MuiChip: { defaultProps: { size: "small" } },
    MuiDialog: { defaultProps: { fullWidth: true, maxWidth: "sm" } },
    MuiTextField: { defaultProps: { size: "small" } },
    MuiToggleButton: { defaultProps: { size: "small" } },
  },
});

// Shared style for subtle motion. Turns itself off for users who prefer reduced motion.
export const hoverLift = {
  transition: "transform 150ms ease, box-shadow 150ms ease",
  "&:hover": { transform: "translateY(-3px)", boxShadow: 4 },
  "@media (prefers-reduced-motion: reduce)": {
    transition: "none",
    "&:hover": { transform: "none" },
  },
};
