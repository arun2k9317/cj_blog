'use client';

import { ContentBlock } from '@/types/project';
import { useState, useRef } from 'react';
import ContentBlockComponent from './ContentBlocks/ContentBlock';
import { IconGripVertical, IconX } from '@tabler/icons-react';

interface DragDropBlockProps {
  block: ContentBlock;
  index: number;
  isEditing?: boolean;
  onUpdate?: (block: ContentBlock) => void;
  onDelete?: (blockId: string) => void;
  onReorder?: (fromIndex: number, toIndex: number) => void;
  onImageUpload?: (file: File) => Promise<string>;
}

export default function DragDropBlock({
  block,
  index,
  isEditing = false,
  onUpdate,
  onDelete,
  onReorder,
  onImageUpload
}: DragDropBlockProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const dragRef = useRef<HTMLDivElement>(null);

  const handleDragStart = (e: React.DragEvent) => {
    if (!isEditing) return;
    
    setIsDragging(true);
    e.dataTransfer.setData('text/plain', index.toString());
    e.dataTransfer.effectAllowed = 'move';
    
    // Add visual feedback
    if (dragRef.current) {
      dragRef.current.style.opacity = '0.5';
    }
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setDragOver(false);
    
    if (dragRef.current) {
      dragRef.current.style.opacity = '1';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (!isEditing) return;
    
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    if (!isEditing) return;
    
    e.preventDefault();
    setDragOver(false);
    
    const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
    if (fromIndex !== index && onReorder) {
      onReorder(fromIndex, index);
    }
  };

  const getBlockTypeLabel = (type: string) => {
    switch (type) {
      case 'text': return 'Text';
      case 'image': return 'Image';
      case 'image-gallery': return 'Gallery';
      case 'quote': return 'Quote';
      case 'spacer': return 'Spacer';
      default: return type;
    }
  };

  return (
    <div
      ref={dragRef}
      draggable={isEditing}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        relative group
        ${isDragging ? 'opacity-50' : ''}
        ${dragOver ? 'ring-2 ring-blue-500 ring-inset' : ''}
        ${isEditing ? 'cursor-move' : ''}
      `}
    >
      {/* Drag Handle */}
      {isEditing && (
        <div className="absolute -left-8 top-0 h-full w-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-move">
            <IconGripVertical size={16} />
          </div>
        </div>
      )}

      {/* Block Type Label */}
      {isEditing && (
        <div className="absolute -top-6 left-0 text-xs text-gray-500 bg-white px-1 rounded">
          {getBlockTypeLabel(block.type)}
        </div>
      )}

      {/* Drop Indicator */}
      {dragOver && (
        <div className="absolute -top-1 left-0 right-0 h-1 bg-blue-500 rounded-full z-10" />
      )}

      {/* Content Block */}
      <ContentBlockComponent
        block={block}
        isEditing={isEditing}
        onUpdate={onUpdate}
        onDelete={onDelete}
        onImageUpload={onImageUpload}
      />

      {/* Block Controls */}
      {isEditing && (
        <div className="absolute -right-8 top-0 h-full w-6 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onDelete?.(block.id)}
            className="w-4 h-4 text-red-400 hover:text-red-600 cursor-pointer"
            title="Delete block"
          >
            <IconX size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
