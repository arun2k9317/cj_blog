import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { FontProvider } from "@/contexts/FontContext";
import AppShell from "@/components/AppShell";
import { MantineProviders } from "@/components/MantineProviders";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Nitin Jamdar",
  description: "Nitin Jamdar's photography",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <MantineProviders>
          <ThemeProvider>
            <FontProvider>
              <AppShell>{children}</AppShell>
            </FontProvider>
          </ThemeProvider>
        </MantineProviders>
      </body>
    </html>
  );
}
