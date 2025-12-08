"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useMediaQuery } from "@mantine/hooks";
import ImageLightbox from "@/components/ImageLightbox";
import MobileImageLightbox from "@/components/MobileImageLightbox";
import { Project } from "@/types/project";

interface ProjectViewerProps {
  project: Project;
}

export default function ProjectViewer({ project }: ProjectViewerProps) {
  const router = useRouter();

  // Extract images from content blocks
  const images = useMemo(() => {
    const imageUrls: string[] = [];
    
    project.contentBlocks
      .sort((a, b) => a.order - b.order)
      .forEach((block) => {
        if ((block.type === 'image' || block.type === 'story-image') && 'src' in block && block.src) {
          imageUrls.push(block.src);
        } else if (block.type === 'image-gallery' && 'images' in block && Array.isArray(block.images)) {
          block.images.forEach((img: { src: string; alt: string; caption?: string }) => {
            if (img?.src) {
              imageUrls.push(img.src);
            }
          });
        }
      });

    return imageUrls;
  }, [project.contentBlocks]);

  const imageCaptions = useMemo(() => {
    return images.map((_, index) => {
      const block = project.contentBlocks.find(b => {
        if ((b.type === 'image' || b.type === 'story-image') && 'src' in b && b.src === images[index]) {
          return true;
        }
        if (b.type === 'image-gallery' && 'images' in b && Array.isArray(b.images)) {
          return b.images.some((img: { src: string; alt: string; caption?: string }) => img?.src === images[index]);
        }
        return false;
      });
      
      if (block && 'caption' in block) {
        return block.caption;
      }
      return undefined;
    });
  }, [images, project.contentBlocks]);

  const handleClose = () => {
    router.push('/');
  };

  if (images.length === 0) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh',
        flexDirection: 'column',
        gap: '1rem',
        padding: '2rem'
      }}>
        <p>No images found in this project.</p>
        <button 
          onClick={handleClose}
          style={{
            padding: '0.5rem 1rem',
            cursor: 'pointer',
            border: '1px solid #ccc',
            borderRadius: '4px',
            background: 'white'
          }}
        >
          ← Back to Home
        </button>
      </div>
    );
  }

  // Mobile detection
  const isMobile = useMediaQuery("(max-width: 768px)");

  return isMobile ? (
    <MobileImageLightbox
      images={images}
      currentIndex={0}
      imageCaptions={imageCaptions}
      projectInfo={{
        title: project.title || 'Untitled Project',
        description: project.description || undefined,
        location: project.location || undefined,
      }}
      isOpen={true}
      onClose={handleClose}
    />
  ) : (
    <ImageLightbox
      images={images}
      currentIndex={0}
      imageCaptions={imageCaptions}
      projectInfo={{
        title: project.title || 'Untitled Project',
        description: project.description || undefined,
        location: project.location || undefined,
      }}
      isOpen={true}
      onClose={handleClose}
    />
  );
}

