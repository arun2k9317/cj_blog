'use client';

import { Box } from '@mantine/core';
import { SpacerBlock as SpacerBlockType } from '@/types/project';

interface SpacerBlockProps {
  block: SpacerBlockType;
  isEditing?: boolean;
  onUpdate?: (block: SpacerBlockType) => void;
  onDelete?: (blockId: string) => void;
}

export default function SpacerBlock({ block, isEditing = false, onUpdate, onDelete }: SpacerBlockProps) {
  if (isEditing) {
    return (
      <div className="content-block-editor border border-gray-300 rounded-lg p-4 bg-white">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-medium text-gray-700">Spacer Block</h3>
          <div className="flex gap-2">
            <button
              onClick={() => onDelete?.(block.id)}
              className="text-red-600 hover:text-red-800 text-sm"
            >
              Delete
            </button>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Height (rem)
          </label>
          <input
            type="number"
            value={block.height}
            onChange={(e) => onUpdate?.({ ...block, height: parseInt(e.target.value) || 1 })}
            min="0.5"
            max="10"
            step="0.5"
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">
            Controls the vertical spacing (1rem = 16px)
          </p>
        </div>
      </div>
    );
  }

  return (
    <Box 
      className="content-block"
      style={{ height: `${block.height}rem` }}
    >
      {/* Visual indicator for editing mode */}
      {isEditing && (
        <Box
          style={{
            width: "100%",
            height: "100%",
            border: "2px dashed var(--gray-300)",
            borderRadius: "var(--mantine-radius-md)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--gray-500)",
            fontSize: "0.875rem",
          }}
        >
          Spacer ({block.height}rem)
        </Box>
      )}
    </Box>
  );
}
