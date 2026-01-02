"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

type FontOption = {
  value: string;
  label: string;
  cssValue: string;
};

export const AVAILABLE_FONTS: FontOption[] = [
  {
    value: "crimson-text",
    label: "Crimson Text",
    cssValue: '"Crimson Text", "Ethos Nova", serif',
  },
  {
    value: "ethos-nova",
    label: "Ethos Nova",
    cssValue: '"Ethos Nova", "Crimson Text", serif',
  },
];

interface FontContextType {
  selectedFont: string;
  setSelectedFont: (font: string) => void;
  fontCssValue: string;
  loading: boolean;
}

const FontContext = createContext<FontContextType | undefined>(undefined);

export function FontProvider({ children }: { children: ReactNode }) {
  const [selectedFont, setSelectedFontState] = useState<string>("crimson-text");
  const [loading, setLoading] = useState(true);

  // Apply default font immediately on mount (before API call completes)
  useEffect(() => {
    const defaultFont = AVAILABLE_FONTS[0];
    document.documentElement.style.setProperty(
      "--font-primary",
      defaultFont.cssValue
    );
  }, []);

  useEffect(() => {
    // Load font preference from API
    fetch("/api/settings/font")
      .then((res) => res.json())
      .then((data) => {
        if (data.font) {
          // Find matching font option
          const fontOption = AVAILABLE_FONTS.find(
            (f) => f.cssValue === data.font || f.value === data.font
          );
          if (fontOption) {
            setSelectedFontState(fontOption.value);
            // Apply font immediately
            document.documentElement.style.setProperty(
              "--font-primary",
              fontOption.cssValue
            );
          } else {
            // Apply default font if no match found
            const defaultFont = AVAILABLE_FONTS[0];
            document.documentElement.style.setProperty(
              "--font-primary",
              defaultFont.cssValue
            );
          }
        } else {
          // Apply default font if no setting found
          const defaultFont = AVAILABLE_FONTS[0];
          document.documentElement.style.setProperty(
            "--font-primary",
            defaultFont.cssValue
          );
        }
      })
      .catch((err) => {
        console.error("Error loading font:", err);
        // Apply default font on error
        const defaultFont = AVAILABLE_FONTS[0];
        document.documentElement.style.setProperty(
          "--font-primary",
          defaultFont.cssValue
        );
      })
      .finally(() => setLoading(false));
  }, []);

  const setSelectedFont = async (font: string) => {
    const fontOption = AVAILABLE_FONTS.find((f) => f.value === font);
    if (!fontOption) return;

    setSelectedFontState(font);

    // Update CSS variable
    document.documentElement.style.setProperty(
      "--font-primary",
      fontOption.cssValue
    );

    // Save to database
    try {
      await fetch("/api/settings/font", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ font: fontOption.cssValue }),
      });
    } catch (error) {
      console.error("Error saving font:", error);
    }
  };

  const fontCssValue =
    AVAILABLE_FONTS.find((f) => f.value === selectedFont)?.cssValue ||
    AVAILABLE_FONTS[0].cssValue;

  // Apply font on mount and when it changes
  useEffect(() => {
    if (!loading) {
      document.documentElement.style.setProperty(
        "--font-primary",
        fontCssValue
      );
    }
  }, [fontCssValue, loading]);

  return (
    <FontContext.Provider
      value={{ selectedFont, setSelectedFont, fontCssValue, loading }}
    >
      {children}
    </FontContext.Provider>
  );
}

export function useFont() {
  const context = useContext(FontContext);
  if (context === undefined) {
    throw new Error("useFont must be used within a FontProvider");
  }
  return context;
}
