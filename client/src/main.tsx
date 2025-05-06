import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "./lib/theme-provider";
import { SiteSettingsProvider } from "./hooks/use-site-settings";
import { AuthProvider } from "./hooks/use-auth";

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <SiteSettingsProvider>
      <AuthProvider>
        <ThemeProvider defaultTheme="light" storageKey="fullsco-theme">
          <App />
          <Toaster />
        </ThemeProvider>
      </AuthProvider>
    </SiteSettingsProvider>
  </QueryClientProvider>
);
