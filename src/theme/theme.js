import { createTheme } from "@mui/material/styles";

// Design system for the app, built on MUI (https://mui.com/material-ui/).
// Colours live as CSS variables in src/index.css; the palette below just points at them.
// Fonts, spacing and component defaults live here, not in individual components.
// In components, use theme values (e.g. color="textSecondary", sx={{ p: 2 }}) instead of raw CSS.

const fontFamily = '"Inter", system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif';
const headingFont = '"Space Grotesk", "Inter", system-ui, sans-serif';

// Same palette for both modes: index.css swaps the variable values when the mode changes.
const palette = {
  primary: {
    main: "var(--accent)",
    dark: "color-mix(in oklch, var(--accent), #000 12%)", // hover
    contrastText: "var(--on-accent)",
  },
  secondary: { main: "var(--accent)", contrastText: "var(--on-accent)" }, // ratings / stars
  error: { main: "var(--danger)", contrastText: "var(--on-danger)" },
  background: { default: "var(--bg)", paper: "var(--panel)" },
  text: { primary: "var(--text)", secondary: "var(--text-muted)" },
  divider: "var(--border)",
};

export const theme = createTheme({
  // The user's light/dark choice is saved and applied by ThemeProvider (see main.jsx).
  // nativeColor lets MUI derive hover/light/dark shades from CSS variables with color-mix().
  cssVariables: { colorSchemeSelector: "data", nativeColor: true },
  colorSchemes: { light: { palette }, dark: { palette } },

  shape: { borderRadius: 10 },

  typography: {
    fontFamily,
    h1: {
      fontFamily: headingFont,
      fontSize: "1.875rem",
      fontWeight: 700,
      letterSpacing: "-0.01em",
    },
    h2: { fontFamily: headingFont, fontSize: "1.5rem", fontWeight: 700 },
    h3: { fontFamily: headingFont, fontSize: "1.25rem", fontWeight: 700 },
    button: { textTransform: "none", fontWeight: 600 },
  },

  components: {
    MuiButton: { defaultProps: { disableElevation: true } },
    MuiCard: { defaultProps: { variant: "outlined" } },
    MuiChip: { defaultProps: { size: "small" } },
    MuiDialog: { defaultProps: { fullWidth: true, maxWidth: "sm" } },
    MuiPaper: { styleOverrides: { root: { backgroundImage: "none" } } },
    MuiTextField: { defaultProps: { size: "small" } },
    MuiToggleButton: { defaultProps: { size: "small" } },
  },
});

// A bordered dark-grey panel (hero, carousel, activity).
export const panelSx = {
  bgcolor: "background.paper",
  border: 1,
  borderColor: "divider",
  borderRadius: "16px",
};

// Shared style for subtle motion. Turns itself off for users who prefer reduced motion.
export const hoverLift = {
  transition: "transform 150ms ease",
  "&:hover": { transform: "translateY(-3px)" },
  "@media (prefers-reduced-motion: reduce)": {
    transition: "none",
    "&:hover": { transform: "none" },
  },
};
