// Project and Content Block Types

export type ContentBlockType = 'text' | 'image' | 'image-gallery' | 'quote' | 'spacer';

export interface BaseContentBlock {
  id: string;
  type: ContentBlockType;
  order: number;
}

export interface TextBlock extends BaseContentBlock {
  type: 'text';
  content: string;
  textAlign?: 'left' | 'center' | 'right';
  fontSize?: 'small' | 'medium' | 'large' | 'xlarge';
  fontWeight?: 'light' | 'normal' | 'medium' | 'bold';
}

export interface ImageBlock extends BaseContentBlock {
  type: 'image';
  src: string;
  alt: string;
  caption?: string;
  aspectRatio?: 'auto' | 'square' | 'landscape' | 'portrait' | 'wide';
  alignment?: 'left' | 'center' | 'right' | 'full-width';
}

export interface ImageGalleryBlock extends BaseContentBlock {
  type: 'image-gallery';
  images: Array<{
    src: string;
    alt: string;
    caption?: string;
  }>;
  layout?: 'grid' | 'masonry' | 'carousel';
  columns?: number;
}

export interface QuoteBlock extends BaseContentBlock {
  type: 'quote';
  text: string;
  author?: string;
  alignment?: 'left' | 'center' | 'right';
  style?: 'minimal' | 'bordered' | 'highlighted';
}

export interface SpacerBlock extends BaseContentBlock {
  type: 'spacer';
  height: number; // in pixels or rem
}

export type ContentBlock = 
  | TextBlock 
  | ImageBlock 
  | ImageGalleryBlock 
  | QuoteBlock 
  | SpacerBlock;

export interface Project {
  id: string;
  title: string;
  slug: string;
  description?: string;
  location?: string;
  architect?: string;
  featuredImage?: string;
  contentBlocks: ContentBlock[];
  createdAt: string;
  updatedAt: string;
  published: boolean;
  tags?: string[];
}

export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  contentBlocks: Omit<ContentBlock, 'id'>[];
}

// Default templates
export const DEFAULT_TEMPLATES: ProjectTemplate[] = [
  {
    id: 'photography-story',
    name: 'Photography Story',
    description: 'A narrative-driven photography project with text and images',
    contentBlocks: [
      {
        type: 'text',
        order: 0,
        content: 'Project Introduction',
        textAlign: 'center',
        fontSize: 'xlarge',
        fontWeight: 'bold'
      },
      {
        type: 'spacer',
        order: 1,
        height: 2
      },
      {
        type: 'text',
        order: 2,
        content: 'Add your project description here...',
        textAlign: 'left',
        fontSize: 'medium',
        fontWeight: 'normal'
      },
      {
        type: 'image',
        order: 3,
        src: '',
        alt: 'Featured image',
        aspectRatio: 'landscape',
        alignment: 'center'
      }
    ]
  },
  {
    id: 'documentary-series',
    name: 'Documentary Series',
    description: 'A documentary-style project with multiple images and text sections',
    contentBlocks: [
      {
        type: 'text',
        order: 0,
        content: 'Documentary Title',
        textAlign: 'center',
        fontSize: 'xlarge',
        fontWeight: 'bold'
      },
      {
        type: 'text',
        order: 1,
        content: 'Location, Date',
        textAlign: 'center',
        fontSize: 'medium',
        fontWeight: 'normal'
      },
      {
        type: 'spacer',
        order: 2,
        height: 2
      },
      {
        type: 'text',
        order: 3,
        content: 'Introduction text...',
        textAlign: 'left',
        fontSize: 'medium',
        fontWeight: 'normal'
      },
      {
        type: 'image-gallery',
        order: 4,
        images: [],
        layout: 'grid',
        columns: 2
      }
    ]
  }
];
