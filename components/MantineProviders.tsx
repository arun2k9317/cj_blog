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
  defaultRadius: "md",
});

export function MantineProviders({ children }: { children: ReactNode }) {
  return (
    <MantineProvider theme={theme} defaultColorScheme="auto">
      {children}
    </MantineProvider>
  );
}
