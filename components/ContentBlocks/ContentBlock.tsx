'use client';

import { ContentBlock as ContentBlockType } from '@/types/project';
import TextBlock from './TextBlock';
import ImageBlock from './ImageBlock';
import ImageGalleryBlock from './ImageGalleryBlock';
import QuoteBlock from './QuoteBlock';
import SpacerBlock from './SpacerBlock';

interface ContentBlockProps {
  block: ContentBlockType;
  isEditing?: boolean;
  onUpdate?: (block: ContentBlockType) => void;
  onDelete?: (blockId: string) => void;
  onImageUpload?: (file: File) => Promise<string>;
}

export default function ContentBlock(props: ContentBlockProps) {
  const { block } = props;

  switch (block.type) {
    case 'text':
      return <TextBlock {...props} block={block} />;
    case 'image':
      return <ImageBlock {...props} block={block} />;
    case 'image-gallery':
      return <ImageGalleryBlock {...props} block={block} />;
    case 'quote':
      return <QuoteBlock {...props} block={block} />;
    case 'spacer':
      return <SpacerBlock {...props} block={block} />;
    default:
      return (
        <div className="content-block p-4 border border-red-300 bg-red-50 text-red-700 rounded">
          Unknown block type: {(block as any).type}
        </div>
      );
  }
}
