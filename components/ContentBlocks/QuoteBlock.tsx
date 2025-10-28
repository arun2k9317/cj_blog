"use client";

import { QuoteBlock as QuoteBlockType } from "@/types/project";
import { useState } from "react";

interface QuoteBlockProps {
  block: QuoteBlockType;
  isEditing?: boolean;
  onUpdate?: (block: QuoteBlockType) => void;
  onDelete?: (blockId: string) => void;
}

export default function QuoteBlock({
  block,
  isEditing = false,
  onUpdate,
  onDelete,
}: QuoteBlockProps) {
  const [isEditingText, setIsEditingText] = useState(false);
  const [isEditingAuthor, setIsEditingAuthor] = useState(false);
  const [text, setText] = useState(block.text);
  const [author, setAuthor] = useState(block.author || "");

  const handleTextSave = () => {
    if (onUpdate) {
      onUpdate({ ...block, text });
    }
    setIsEditingText(false);
  };

  const handleTextCancel = () => {
    setText(block.text);
    setIsEditingText(false);
  };

  const handleAuthorSave = () => {
    if (onUpdate) {
      onUpdate({ ...block, author });
    }
    setIsEditingAuthor(false);
  };

  const handleAuthorCancel = () => {
    setAuthor(block.author || "");
    setIsEditingAuthor(false);
  };

  const getAlignmentClass = (align?: string) => {
    switch (align) {
      case "left":
        return "text-left";
      case "right":
        return "text-right";
      default:
        return "text-center";
    }
  };

  const getStyleClass = (style?: string) => {
    switch (style) {
      case "bordered":
        return "border-l-4 border-gray-300 pl-4";
      case "highlighted":
        return "bg-yellow-50 border border-yellow-200 p-4 rounded-lg";
      default:
        return "";
    }
  };

  if (isEditing) {
    return (
      <div className="content-block-editor border border-gray-300 rounded-lg p-4 bg-white">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-medium text-gray-700">Quote Block</h3>
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
              Quote Text
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="Enter the quote text..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Author (Optional)
            </label>
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Quote author"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Alignment
              </label>
              <select
                value={block.alignment || "center"}
                onChange={(e) =>
                  onUpdate?.({
                    ...block,
                    alignment: e.target.value as QuoteBlockType["alignment"],
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
                Style
              </label>
              <select
                value={block.style || "minimal"}
                onChange={(e) =>
                  onUpdate?.({
                    ...block,
                    style: e.target.value as QuoteBlockType["style"],
                  })
                }
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="minimal">Minimal</option>
                <option value="bordered">Bordered</option>
                <option value="highlighted">Highlighted</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`content-block ${getAlignmentClass(block.alignment)}`}>
      <blockquote className={`text-lg italic ${getStyleClass(block.style)}`}>
        {isEditingText ? (
          <div className="space-y-3">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={handleTextSave}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Save
              </button>
              <button
                onClick={handleTextCancel}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div
            className="cursor-pointer hover:bg-gray-50 p-2 rounded"
            onClick={() => setIsEditingText(true)}
          >
            {block.text || "Click to add quote text..."}
          </div>
        )}

        {block.author && (
          <footer className="mt-3 text-sm text-gray-600">
            {isEditingAuthor ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Author name"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleAuthorSave}
                    className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                  >
                    Save
                  </button>
                  <button
                    onClick={handleAuthorCancel}
                    className="px-3 py-1 bg-gray-300 text-gray-700 rounded text-sm hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div
                className="cursor-pointer hover:bg-gray-50 p-1 rounded"
                onClick={() => setIsEditingAuthor(true)}
              >
                — {block.author}
              </div>
            )}
          </footer>
        )}
      </blockquote>
    </div>
  );
}
