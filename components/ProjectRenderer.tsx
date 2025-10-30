"use client";

import { Project } from "@/types/project";
import ContentBlockComponent from "./ContentBlocks/ContentBlock";

interface ProjectRendererProps {
  project: Project;
  className?: string;
}

export default function ProjectRenderer({
  project,
  className = "",
}: ProjectRendererProps) {
  const sortedBlocks = project.contentBlocks.sort((a, b) => a.order - b.order);

  return (
    <div className={`project-renderer ${className}`}>
      {/* Project Header */}
      <div className="project-header text-left mb-8">
        <h1 className="text-[15px] font-bold text-gray-900 mb-4">
          {project.title}
        </h1>

        {project.location && (
          <div className="text-[13px] text-gray-600 mb-4">
            {project.location && <span>{project.location}</span>}
          </div>
        )}

        {project.description && (
          <p className="text-[13px] text-gray-700 max-w-3xl mx-auto leading-relaxed">
            {project.description}
          </p>
        )}
      </div>

      {/* Content Blocks */}
      <div className="project-content space-y-12">
        {sortedBlocks.map((block) => (
          <ContentBlockComponent
            key={block.id}
            block={block}
            isEditing={false}
          />
        ))}
      </div>

      {/* Project Footer */}
      <div className="project-footer mt-12 pt-8 border-t border-gray-200">
        <div className="text-[12px] text-gray-500 text-center">
          <p>Created: {new Date(project.createdAt).toLocaleDateString()}</p>
          {project.updatedAt !== project.createdAt && (
            <p>Updated: {new Date(project.updatedAt).toLocaleDateString()}</p>
          )}
        </div>
      </div>
    </div>
  );
}
