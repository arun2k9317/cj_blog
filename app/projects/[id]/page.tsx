"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import ProjectRenderer from "@/components/ProjectRenderer";
import { Project } from "@/types/project";

// Hardcoded project data using Vercel Blob storage
const BLOB_BASE =
  "https://v96anmwogiriaihi.public.blob.vercel-storage.com/admin-uploads";

const range = (n: number) => Array.from({ length: n }, (_, i) => i + 1);

const projectsData = {
  "behind-the-tea-cup": {
    id: "behind-the-tea-cup",
    title: "Behind The Tea Cup",
    location: "",
    architect: "",
    description: "Behind The Tea Cup photo series.",
    images: range(10).map(
      (i) => `${BLOB_BASE}/behindTheTeaCup/behindTheTeaCup_${i}.jpg`
    ),
  },
  "coffee-and-the-hills": {
    id: "coffee-and-the-hills",
    title: "Coffee And The Hills",
    location: "",
    architect: "",
    description: "Coffee And The Hills photo series.",
    images: range(16).map(
      (i) => `${BLOB_BASE}/coffeeAndTheHills/coffeeAndTheHills_${i}.jpg`
    ),
  },
  "dusk-falls-on-mountains": {
    id: "dusk-falls-on-mountains",
    title: "Dusk Falls On Mountains",
    location: "",
    architect: "",
    description: "Dusk Falls On Mountains photo series.",
    images: range(7).map(
      (i) => `${BLOB_BASE}/duskFallsOnMountains/duskFallsOnMountains_${i}.jpg`
    ),
  },
  kalaripayattu: {
    id: "kalaripayattu",
    title: "kalaripayattu",
    location: "",
    architect: "",
    description: "kalaripayattu photo series.",
    images: range(15).map(
      (i) => `${BLOB_BASE}/kalaripayattu/kalaripayattu_${i}.JPG`
    ),
  },
};

export default function ProjectDetailPage({ params }: { params: { id: string } }) {
  const projectId = params.id;
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  // Try to fetch from API first, fallback to static data
  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await fetch(`/api/projects/${projectId}`);
        if (response.ok) {
          const data = await response.json();
          setProject(data.project);
        } else {
          const staticProject = projectsData[projectId as keyof typeof projectsData];
          if (staticProject) {
            const convertedProject: Project = {
              id: staticProject.id,
              title: staticProject.title,
              slug: staticProject.id,
              description: staticProject.description,
              location: staticProject.location,
              contentBlocks: staticProject.images.map((image, index) => ({
                id: `img-${index + 1}`,
                type: "image" as const,
                order: index,
                src: image,
                alt: `${staticProject.title} - Image ${index + 1}`,
                alignment: "center" as const,
                aspectRatio: "landscape" as const,
              })),
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              published: true,
            };
            setProject(convertedProject);
          }
        }
      } catch (error) {
        console.error("Error fetching project:", error);
        const staticProject = projectsData[projectId as keyof typeof projectsData];
        if (staticProject) {
          const convertedProject: Project = {
            id: staticProject.id,
            title: staticProject.title,
            slug: staticProject.id,
            description: staticProject.description,
            location: staticProject.location,
            contentBlocks: staticProject.images.map((image, index) => ({
              id: `img-${index + 1}`,
              type: "image" as const,
              order: index,
              src: image,
              alt: `${staticProject.title} - Image ${index + 1}`,
              alignment: "center" as const,
              aspectRatio: "landscape" as const,
            })),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            published: true,
          };
          setProject(convertedProject);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [projectId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900"></div>
          <p>Loading project...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="project-not-found">
        <h1>Project Not Found</h1>
        <p>The project you&apos;re looking for doesn&apos;t exist.</p>
        <Link href="/projects" className="back-to-projects">
          ← Back to Projects
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <ProjectRenderer project={project} />

      {/* Back to Projects Link */}
      <div className="mt-8 text-center">
        <Link href="/projects" className="back-to-projects">
          ← Back to Projects
        </Link>
      </div>
    </div>
  );
}
