"use client";
import { createTheme } from "@mui/material/styles";

// Amazing brand palette
const YELLOW  = "#FDC500";
const BLACK   = "#121212";
const WHITE   = "#FAFAFA";
const PURPLE  = "#68009F";
const PINK    = "#D2006F";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: YELLOW,
      light: "#FDD633",
      dark: "#E6B200",
      contrastText: BLACK,
    },
    secondary: {
      main: PURPLE,
      light: "#8B00D4",
      dark: "#4A006F",
      contrastText: WHITE,
    },
    error: {
      main: PINK,
      contrastText: WHITE,
    },
    success: {
      main: "#059669",
      light: "#ecfdf5",
    },
    warning: {
      main: "#d97706",
      light: "#fffbeb",
    },
    background: {
      default: WHITE,
      paper: "#FFFFFF",
    },
    text: {
      primary: BLACK,
      secondary: "#4B5563",
      disabled: "#9CA3AF",
    },
    divider: "#E5E7EB",
  },
  typography: {
    fontFamily: [
      "var(--font-inter)",
      "Inter",
      "-apple-system",
      "BlinkMacSystemFont",
      "Segoe UI",
      "sans-serif",
    ].join(","),
    h4: { fontWeight: 800, letterSpacing: "-0.025em" },
    h5: { fontWeight: 700, letterSpacing: "-0.02em" },
    h6: { fontWeight: 700, letterSpacing: "-0.01em" },
    body1: { lineHeight: 1.65 },
    body2: { lineHeight: 1.6 },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.04)",
          border: "1px solid #E5E7EB",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 700,
          borderRadius: 8,
          letterSpacing: 0,
        },
        containedPrimary: {
          color: BLACK,
          "&:hover": { backgroundColor: "#E6B200" },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          fontSize: "0.72rem",
          letterSpacing: 0,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "transparent",
          boxShadow: "none",
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
          fontSize: "0.875rem",
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          backgroundColor: YELLOW,
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: { borderColor: "#F3F4F6" },
      },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          "&.Mui-selected": {
            backgroundColor: YELLOW,
            color: BLACK,
            "&:hover": { backgroundColor: "#E6B200" },
          },
        },
      },
    },
  },
});

export default theme;
