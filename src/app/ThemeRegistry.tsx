"use client";

import { AppRouterCacheProvider } from "@mui/material-nextjs/v14-appRouter";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { NavigationProvider } from "@/contexts/NavigationContext";
import { NavigationOverlay } from "@/components/ui/NavigationOverlay";
import theme from "./theme";

export default function ThemeRegistry({ children }: { children: React.ReactNode }) {
  return (
    <AppRouterCacheProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <NavigationProvider>
          <NavigationOverlay />
          {children}
        </NavigationProvider>
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
}
