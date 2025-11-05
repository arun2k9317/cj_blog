"use client";

import Link from "next/link";
import Image from "next/image";

// Hardcoded stories pointing to Vercel Blob storage
const BLOB_BASE =
  "https://v96anmwogiriaihi.public.blob.vercel-storage.com/admin-uploads";

const stories = [
  {
    id: "dusk-falls-on-mountains",
    title: "Dusk Falls On Mountains",
    location: "",
    thumbnail: `${BLOB_BASE}/duskFallsOnMountains/duskFallsOnMountains_1.jpg`,
    description: "Photo series: Dusk Falls On Mountains.",
  },
  {
    id: "kalaripayattu",
    title: "kalaripayattu",
    location: "",
    thumbnail: `${BLOB_BASE}/kalaripayattu/kalaripayattu_1.JPG`,
    description: "Photo series: kalaripayattu.",
  },
];

export default function StoriesPage() {
  return (
    <div className="projects-container">
      <div className="projects-header">
        <h1>Stories</h1>
      </div>

      <div className="projects-grid">
        {stories.map((story) => (
          <Link
            key={story.id}
            href={`/projects/${story.id}`}
            className="project-card"
          >
            <div className="project-image-container">
              <Image
                src={story.thumbnail}
                alt={story.title}
                className="project-thumbnail"
                width={600}
                height={400}
                style={{ objectFit: "cover" }}
              />
            </div>
            <div className="project-info">
              <h3 className="project-title">{story.title}</h3>
              <p className="project-location">{story.location}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
