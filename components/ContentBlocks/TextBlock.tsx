'use client';

import { TextBlock as TextBlockType } from '@/types/project';
import { useState } from 'react';

interface TextBlockProps {
  block: TextBlockType;
  isEditing?: boolean;
  onUpdate?: (block: TextBlockType) => void;
  onDelete?: (blockId: string) => void;
}

export default function TextBlock({ block, isEditing = false, onUpdate, onDelete }: TextBlockProps) {
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
      case 'center': return 'text-center';
      case 'right': return 'text-right';
      default: return 'text-left';
    }
  };

  const getFontSizeClass = (size?: string) => {
    switch (size) {
      case 'small': return 'text-sm';
      case 'medium': return 'text-base';
      case 'large': return 'text-xl';
      case 'xlarge': return 'text-3xl';
      default: return 'text-base';
    }
  };

  const getFontWeightClass = (weight?: string) => {
    switch (weight) {
      case 'light': return 'font-light';
      case 'normal': return 'font-normal';
      case 'medium': return 'font-medium';
      case 'bold': return 'font-bold';
      default: return 'font-normal';
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
                value={block.textAlign || 'left'}
                onChange={(e) => onUpdate?.({ ...block, textAlign: e.target.value as any })}
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
                value={block.fontSize || 'medium'}
                onChange={(e) => onUpdate?.({ ...block, fontSize: e.target.value as any })}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
                <option value="xlarge">Extra Large</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Font Weight
              </label>
              <select
                value={block.fontWeight || 'normal'}
                onChange={(e) => onUpdate?.({ ...block, fontWeight: e.target.value as any })}
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

  return (
    <div className={`content-block ${getTextAlignClass(block.textAlign)}`}>
      {isEditingText ? (
        <div className="space-y-3">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={4}
            autoFocus
          />
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Save
            </button>
            <button
              onClick={handleCancel}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div
          className={`cursor-pointer hover:bg-gray-50 p-2 rounded ${getFontSizeClass(block.fontSize)} ${getFontWeightClass(block.fontWeight)}`}
          onClick={() => setIsEditingText(true)}
        >
          {block.content || 'Click to add text content...'}
        </div>
      )}
    </div>
  );
}
