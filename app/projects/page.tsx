"use client";

import Link from "next/link";
import Image from "next/image";

// Hardcoded projects pointing to Vercel Blob storage
const BLOB_BASE =
  "https://v96anmwogiriaihi.public.blob.vercel-storage.com/admin-uploads";

const projects = [
  {
    id: "behind-the-tea-cup",
    title: "Behind The Tea Cup",
    location: "",
    architect: "",
    thumbnail: `${BLOB_BASE}/behindTheTeaCup/behindTheTeaCup_1.jpg`,
    description: "Photo series: Behind The Tea Cup.",
  },
  {
    id: "coffee-and-the-hills",
    title: "Coffee And The Hills",
    location: "",
    architect: "",
    thumbnail: `${BLOB_BASE}/coffeeAndTheHills/coffeeAndTheHills_1.jpg`,
    description: "Photo series: Coffee And The Hills.",
  },
];

export default function ProjectsPage() {
  return (
    <div className="projects-container">
      <div className="projects-header">
        <h1>Projects</h1>
      </div>

      <div className="projects-grid">
        {projects.map((project) => (
          <Link
            key={project.id}
            href={`/projects/${project.id}`}
            className="project-card"
          >
            <div className="project-image-container">
              <Image
                src={project.thumbnail}
                alt={project.title}
                className="project-thumbnail"
                width={600}
                height={400}
                style={{ objectFit: "cover" }}
              />
            </div>
            <div className="project-info">
              <h3 className="project-title">{project.title}</h3>
              <p className="project-location">{project.location}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
