"use client";

import { useMemo } from "react";
import Image from "next/image";
import { Stack, Text, Container } from "@mantine/core";
import type { ContentBlock } from "@/types/project";
import { useTheme } from "@/contexts/ThemeContext";

interface StoryDisplayProps {
  blocks: ContentBlock[];
}

export default function StoryDisplay({ blocks }: StoryDisplayProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const renderedBlocks = useMemo(() => {
    return blocks.map((block, index) => {
      switch (block.type) {
        case "title":
          const titleBlock = block as any;
          const fontSizeMap: Record<string, string> = {
            small: "0.75rem", // 12px
            medium: "0.875rem", // 14px
            large: "0.9375rem", // 15px (max)
            xl: "0.9375rem", // 15px (max)
            "2xl": "0.9375rem", // 15px (max)
            "3xl": "0.9375rem", // 15px (max)
          };
          const fontSize =
            fontSizeMap[titleBlock.fontSize || "large"] || "0.9375rem";
          return (
            <div
              key={block.id}
              style={{
                textAlign: titleBlock.alignment || "left",
                marginBottom: "var(--mantine-spacing-lg)",
              }}
            >
              <Text
                size={fontSize}
                fw={700}
                c={
                  isDark
                    ? "var(--mantine-color-gray-0)"
                    : "var(--mantine-color-dark-9)"
                }
                style={{ lineHeight: 1.2 }}
              >
                {titleBlock.text || ""}
              </Text>
              {titleBlock.subtitle && (
                <Text size="md" c="dimmed" mt="xs" style={{ lineHeight: 1.4 }}>
                  {titleBlock.subtitle}
                </Text>
              )}
            </div>
          );

        case "description":
          const descBlock = block as any;
          const maxWidth = descBlock.maxWidth || 800;
          const lineHeight = descBlock.lineHeight || 1.6;
          return (
            <div
              key={block.id}
              style={{
                maxWidth: `${maxWidth}px`,
                margin: "0 auto",
                marginBottom: "var(--mantine-spacing-lg)",
                lineHeight: lineHeight,
              }}
            >
              <div
                dangerouslySetInnerHTML={{ __html: descBlock.content || "" }}
                style={{
                  color: isDark
                    ? "var(--mantine-color-gray-0)"
                    : "var(--mantine-color-dark-9)",
                }}
              />
            </div>
          );

        case "story-image":
          const imageBlock = block as any;
          if (!imageBlock.src) return null;

          const nextBlock = blocks[index + 1];
          const hasLabelBelow =
            nextBlock?.type === "image-label" &&
            (nextBlock as any).placement === "below";

          const containerStyle: React.CSSProperties = {
            marginBottom: hasLabelBelow
              ? "var(--mantine-spacing-xs)"
              : "var(--mantine-spacing-lg)",
            position: "relative",
          };

          // Handle size: narrow, full-width, or custom number
          const sizeValue = imageBlock.size;
          if (sizeValue === "narrow") {
            containerStyle.marginLeft = "auto";
            containerStyle.marginRight = "auto";
            containerStyle.maxWidth = "60%";
          } else if (typeof sizeValue === "number") {
            containerStyle.marginLeft = "auto";
            containerStyle.marginRight = "auto";
            containerStyle.maxWidth = `${sizeValue}px`;
          }
          // full-width doesn't need any special styling

          const aspectRatioMap: Record<string, string> = {
            square: "1 / 1",
            landscape: "16 / 9",
            portrait: "3 / 4",
            wide: "21 / 9",
            tall: "2 / 3",
            auto: "auto",
          };

          // Check if aspect ratio is locked and get the ratio
          const aspectRatioLocked =
            imageBlock.aspectRatioLock === true ||
            imageBlock.aspectRatioLock === "true";
          const aspectRatio = aspectRatioLocked
            ? aspectRatioMap[imageBlock.aspectRatio || "auto"] || "auto"
            : "auto";

          const hasAspectRatio = aspectRatio !== "auto";

          return (
            <div key={block.id} style={containerStyle}>
              {hasAspectRatio ? (
                <div
                  style={{
                    position: "relative",
                    width: "100%",
                    aspectRatio,
                    minHeight: "200px",
                    overflow: "hidden",
                    backgroundColor: isDark
                      ? "var(--mantine-color-dark-4)"
                      : "var(--mantine-color-gray-1)",
                  }}
                >
                  <Image
                    src={imageBlock.src}
                    alt={imageBlock.alt || ""}
                    fill
                    style={{ objectFit: "cover" }}
                    sizes="(max-width: 768px) 100vw, 80vw"
                  />
                </div>
              ) : (
                <div
                  style={{
                    position: "relative",
                    width: "100%",
                    overflow: "hidden",
                    backgroundColor: isDark
                      ? "var(--mantine-color-dark-4)"
                      : "var(--mantine-color-gray-1)",
                  }}
                >
                  <Image
                    src={imageBlock.src}
                    alt={imageBlock.alt || ""}
                    width={1200}
                    height={800}
                    style={{
                      width: "100%",
                      height: "auto",
                      objectFit: "contain",
                    }}
                    sizes="(max-width: 768px) 100vw, 80vw"
                  />
                </div>
              )}
            </div>
          );

        case "image-label":
          const labelBlock = block as any;
          const prevBlock = blocks[index - 1];
          const isOverlay = labelBlock.placement === "overlay";
          const isTiedToImage = prevBlock?.type === "story-image";

          if (!isTiedToImage) return null;

          if (isOverlay) {
            return (
              <div
                key={block.id}
                style={{
                  position: "relative",
                  marginTop: "-60px",
                  marginBottom: "var(--mantine-spacing-lg)",
                  padding: "var(--mantine-spacing-sm)",
                  backgroundColor: isDark
                    ? "rgba(0, 0, 0, 0.7)"
                    : "rgba(255, 255, 255, 0.9)",
                  color: isDark
                    ? "var(--mantine-color-gray-0)"
                    : "var(--mantine-color-dark-9)",
                  textAlign: "center",
                }}
              >
                <Text
                  size="xs"
                  style={{ fontStyle: labelBlock.italic ? "italic" : "normal" }}
                >
                  {labelBlock.text || ""}
                </Text>
              </div>
            );
          }

          return (
            <div
              key={block.id}
              style={{
                textAlign: "center",
                marginBottom: "var(--mantine-spacing-lg)",
              }}
            >
              <Text
                size="xs"
                c="dimmed"
                style={{ fontStyle: labelBlock.italic ? "italic" : "normal" }}
              >
                {labelBlock.text || ""}
              </Text>
            </div>
          );

        case "quote":
          const quoteBlock = block as any;
          return (
            <div
              key={block.id}
              style={{
                textAlign: quoteBlock.alignment || "center",
                marginBottom: "var(--mantine-spacing-lg)",
                padding: "var(--mantine-spacing-xl)",
                borderLeft: "4px solid",
                borderColor: isDark
                  ? "var(--mantine-color-gray-4)"
                  : "var(--mantine-color-gray-6)",
                backgroundColor: isDark
                  ? "var(--mantine-color-dark-5)"
                  : "var(--mantine-color-gray-0)",
              }}
            >
              <Text
                size="xl"
                fw={300}
                style={{ fontStyle: "italic", lineHeight: 1.6 }}
                c={
                  isDark
                    ? "var(--mantine-color-gray-0)"
                    : "var(--mantine-color-dark-9)"
                }
              >
                &ldquo;{quoteBlock.text || ""}&rdquo;
              </Text>
              {quoteBlock.author && (
                <Text
                  size="sm"
                  c="dimmed"
                  mt="md"
                  style={{ textAlign: quoteBlock.alignment || "center" }}
                >
                  &mdash; {quoteBlock.author}
                </Text>
              )}
            </div>
          );

        case "divider":
          const dividerBlock = block as any;
          return (
            <div
              key={block.id}
              style={{
                marginTop: `${dividerBlock.spacingTop || 20}px`,
                marginBottom: `${dividerBlock.spacingBottom || 20}px`,
                borderTop: "1px solid",
                borderColor: isDark
                  ? "var(--mantine-color-dark-4)"
                  : "var(--mantine-color-gray-3)",
              }}
            />
          );

        case "footer":
          const footerBlock = block as any;
          const footerWidthMap: Record<string, string> = {
            full: "100%",
            medium: "800px",
            narrow: "600px",
          };
          const footerWidth =
            footerWidthMap[footerBlock.pageWidth || "medium"] || "800px";

          return (
            <div
              key={block.id}
              style={{
                maxWidth: footerWidth,
                margin: "0 auto",
                marginTop: "var(--mantine-spacing-xl)",
                marginBottom: "var(--mantine-spacing-xl)",
                paddingTop: "var(--mantine-spacing-lg)",
                borderTop: "1px solid",
                borderColor: isDark
                  ? "var(--mantine-color-dark-4)"
                  : "var(--mantine-color-gray-3)",
              }}
            >
              <Stack gap="xs" align="center">
                {footerBlock.text && (
                  <Text size="xs" c="dimmed" ta="center">
                    {footerBlock.text}
                  </Text>
                )}
                {footerBlock.date && (
                  <Text size="xs" c="dimmed" ta="center">
                    {footerBlock.date}
                  </Text>
                )}
                {footerBlock.credits && (
                  <Text size="xs" c="dimmed" ta="center">
                    {footerBlock.credits}
                  </Text>
                )}
              </Stack>
            </div>
          );

        default:
          return null;
      }
    });
  }, [blocks, isDark]);

  return (
    <Container size="lg" py="xl" px="md">
      <Stack gap={0}>{renderedBlocks}</Stack>
    </Container>
  );
}
