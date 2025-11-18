"use client";

import { useState, useEffect, useMemo } from "react";
import ImageLightbox from "./ImageLightbox";
import type { Project } from "@/types/project";
import { Loader } from "@mantine/core";

interface ProjectPreviewProps {
  projectId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProjectPreview({
  projectId,
  isOpen,
  onClose,
}: ProjectPreviewProps) {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Extract images and captions from project
  const { images, imageCaptions } = useMemo(() => {
    if (!project) return { images: [], imageCaptions: [] };

    const imageUrls: string[] = [];
    const captions: (string | undefined)[] = [];

    // Process content blocks to extract images
    for (const block of project.contentBlocks) {
      if (block.type === "image-gallery" && "images" in block) {
        for (const img of block.images) {
          imageUrls.push(img.src);
          captions.push(img.caption);
        }
      } else if (block.type === "image" && "src" in block) {
        imageUrls.push(block.src);
        captions.push("caption" in block ? block.caption : undefined);
      }
    }

    // If no images in content blocks, use featured image
    if (imageUrls.length === 0 && project.featuredImage) {
      imageUrls.push(project.featuredImage);
      captions.push(undefined);
    }

    return { images: imageUrls, imageCaptions: captions };
  }, [project]);

  useEffect(() => {
    if (!isOpen || !projectId) return;

    const fetchProject = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/projects/${encodeURIComponent(projectId)}`);
        if (!response.ok) {
          throw new Error("Failed to load project");
        }
        const data = (await response.json()) as { project?: Project };
        if (data.project) {
          setProject(data.project);
          setCurrentImageIndex(0);
        } else {
          setError("Project not found");
        }
      } catch (err) {
        console.error("Error fetching project:", err);
        setError(err instanceof Error ? err.message : "Failed to load project");
      } finally {
        setLoading(false);
      }
    };

    void fetchProject();
  }, [isOpen, projectId]);

  if (!isOpen) return null;

  if (loading) {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
        }}
      >
        <Loader color="white" size="lg" />
      </div>
    );
  }

  if (error || !project || images.length === 0) {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
          color: "white",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        <p>{error || "No images found in project"}</p>
        <button
          onClick={onClose}
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: "white",
            color: "black",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Close
        </button>
      </div>
    );
  }

  return (
    <ImageLightbox
      images={images}
      imageCaptions={imageCaptions}
      currentIndex={currentImageIndex}
      projectInfo={{
        title: project.title,
        description: project.description,
        location: project.location,
      }}
      isOpen={isOpen}
      onClose={onClose}
      onImageChange={setCurrentImageIndex}
    />
  );
}

