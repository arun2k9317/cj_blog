"use client";

import { TextBlock as TextBlockType } from "@/types/project";
import { Box, Text, Stack } from "@mantine/core";
import { useState } from "react";

interface TextBlockProps {
  block: TextBlockType;
  isEditing?: boolean;
  onUpdate?: (block: TextBlockType) => void;
  onDelete?: (blockId: string) => void;
}

export default function TextBlock({
  block,
  isEditing = false,
  onUpdate,
  onDelete,
}: TextBlockProps) {
  const [isEditingText, setIsEditingText] = useState(false);
  const [content, setContent] = useState(block.content);

  const handleSave = () => {
    if (onUpdate) {
      onUpdate({ ...block, content });
    }
    setIsEditingText(false);
  };

  const handleCancel = () => {
    setContent(block.content);
    setIsEditingText(false);
  };

  const getTextAlignClass = (align?: string) => {
    switch (align) {
      case "center":
        return "text-center";
      case "right":
        return "text-right";
      default:
        return "text-left";
    }
  };

  const getFontSizeClass = (size?: string) => {
    switch (size) {
      case "small":
        return "text-sm";
      case "medium":
        return "text-base";
      case "large":
        return "text-xl";
      case "xl":
        return "text-3xl";
      default:
        return "text-base";
    }
  };

  const getFontWeightClass = (weight?: string) => {
    switch (weight) {
      case "light":
        return "font-light";
      case "normal":
        return "font-normal";
      case "medium":
        return "font-medium";
      case "bold":
        return "font-bold";
      default:
        return "font-normal";
    }
  };

  if (isEditing) {
    return (
      <div className="content-block-editor border border-gray-300 rounded-lg p-4 bg-white">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-medium text-gray-700">Text Block</h3>
          <div className="flex gap-2">
            <button
              onClick={() => onDelete?.(block.id)}
              className="text-red-600 hover:text-red-800 text-sm"
            >
              Delete
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Content
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={4}
              placeholder="Enter your text content..."
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Text Alignment
              </label>
              <select
                value={block.textAlign || "left"}
                onChange={(e) =>
                  onUpdate?.({
                    ...block,
                    textAlign: e.target.value as TextBlockType["textAlign"],
                  })
                }
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Font Size
              </label>
              <select
                value={block.fontSize || "medium"}
                onChange={(e) =>
                  onUpdate?.({
                    ...block,
                    fontSize: e.target.value as TextBlockType["fontSize"],
                  })
                }
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
                <option value="xl">Extra Large</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Font Weight
              </label>
              <select
                value={block.fontWeight || "normal"}
                onChange={(e) =>
                  onUpdate?.({
                    ...block,
                    fontWeight: e.target.value as TextBlockType["fontWeight"],
                  })
                }
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="light">Light</option>
                <option value="normal">Normal</option>
                <option value="medium">Medium</option>
                <option value="bold">Bold</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const getTextAlign = (align?: string) => {
    switch (align) {
      case "center":
        return "center";
      case "right":
        return "right";
      default:
        return "left";
    }
  };

  const getSize = (size?: string) => {
    switch (size) {
      case "small":
        return "sm";
      case "large":
        return "lg";
      case "xl":
        return "xl";
      default:
        return "md";
    }
  };

  const getWeight = (weight?: string) => {
    switch (weight) {
      case "light":
        return 300;
      case "medium":
        return 500;
      case "bold":
        return 700;
      default:
        return 400;
    }
  };

  return (
    <Box className={`content-block`} style={{ textAlign: getTextAlign(block.textAlign) as any }}>
      {isEditingText ? (
        <Stack gap="sm">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            style={{
              width: "100%",
              padding: "0.75rem",
              border: "1px solid var(--gray-300)",
              borderRadius: "var(--mantine-radius-md)",
            }}
            rows={4}
            autoFocus
          />
          <Box style={{ display: "flex", gap: "0.5rem" }}>
            <button
              onClick={handleSave}
              style={{
                padding: "0.5rem 1rem",
                backgroundColor: "#2563eb",
                color: "white",
                borderRadius: "var(--mantine-radius-md)",
                border: "none",
                cursor: "pointer",
              }}
            >
              Save
            </button>
            <button
              onClick={handleCancel}
              style={{
                padding: "0.5rem 1rem",
                backgroundColor: "var(--gray-300)",
                color: "var(--gray-700)",
                borderRadius: "var(--mantine-radius-md)",
                border: "none",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          </Box>
        </Stack>
      ) : (
        <Text
          size={getSize(block.fontSize)}
          fw={getWeight(block.fontWeight)}
          style={{
            cursor: "pointer",
            padding: "0.5rem",
            borderRadius: "var(--mantine-radius-sm)",
          }}
          onClick={() => setIsEditingText(true)}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "var(--gray-100)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
          }}
        >
          {block.content || "Click to add text content..."}
        </Text>
      )}
    </Box>
  );
}
