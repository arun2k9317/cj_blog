"use client";

import { MantineProvider, createTheme } from "@mantine/core";
import { ReactNode } from "react";

const baseFontStack =
  'var(--font-primary), var(--font-geist-sans), "Segoe UI", Roboto, sans-serif';

const theme = createTheme({
  fontFamily: baseFontStack,
  headings: {
    fontFamily: baseFontStack,
    fontWeight: "600",
    sizes: {
      h1: { fontSize: "15px", lineHeight: "1.2" },
      h2: { fontSize: "14px", lineHeight: "1.25" },
      h3: { fontSize: "13px", lineHeight: "1.3" },
      h4: { fontSize: "12px", lineHeight: "1.35" },
      h5: { fontSize: "11px", lineHeight: "1.4" },
      h6: { fontSize: "10px", lineHeight: "1.45" },
    },
  },
  fontSizes: {
    xs: "10px",
    sm: "11px",
    md: "12px",
    lg: "13px",
    xl: "15px",
  },
  spacing: {
    xs: "4px",
    sm: "8px",
    md: "16px",
    lg: "24px",
    xl: "40px",
  },
  breakpoints: {
    xs: "480px",
    sm: "768px",
    md: "1024px",
    lg: "1200px",
    xl: "1440px",
  },
  defaultRadius: "md",
  primaryColor: "dark",
  colors: {
    // Map gray colors to match CSS variables
    gray: [
      "#f5f5f5", // gray-100
      "#e5e5e5", // gray-200
      "#d4d4d4", // gray-300
      "#a3a3a3", // gray-400
      "#737373", // gray-500
      "#525252", // gray-600
      "#404040", // gray-700
      "#262626", // gray-800
      "#171717", // gray-900
    ],
  },
  other: {
    // Custom colors to match CSS variables
    background: "var(--background)",
    foreground: "var(--foreground)",
  },
});

export function MantineProviders({ children }: { children: ReactNode }) {
  return (
    <MantineProvider theme={theme} defaultColorScheme="auto">
      {children}
    </MantineProvider>
  );
}
