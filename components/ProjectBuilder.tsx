"use client";

import { useState } from "react";
import {
  Project,
  ContentBlock,
  ContentBlockType,
  DEFAULT_TEMPLATES,
} from "@/types/project";
import DragDropBlock from "./DragDropBlock";

interface ProjectBuilderProps {
  project?: Project;
  onSave?: (project: Project) => void;
  onImageUpload?: (file: File) => Promise<string>;
}

export default function ProjectBuilder({
  project,
  onSave,
  onImageUpload,
}: ProjectBuilderProps) {
  const [isEditing, setIsEditing] = useState(true);
  const [showAddBlock, setShowAddBlock] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);

  const [projectData, setProjectData] = useState<Project>(
    project || {
      id: "",
      title: "",
      slug: "",
      description: "",
      contentBlocks: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      published: false,
    }
  );

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const addBlock = (type: ContentBlockType) => {
    const newBlock: ContentBlock = {
      id: generateId(),
      type,
      order: projectData.contentBlocks.length,
      ...(type === "text" && {
        content: "",
        textAlign: "left",
        fontSize: "medium",
        fontWeight: "normal",
      }),
      ...(type === "image" && {
        src: "",
        alt: "",
        alignment: "center",
        aspectRatio: "auto",
      }),
      ...(type === "image-gallery" && {
        images: [],
        layout: "grid",
        columns: 3,
      }),
      ...(type === "quote" && {
        text: "",
        alignment: "center",
        style: "minimal",
      }),
      ...(type === "spacer" && { height: 2 }),
    } as ContentBlock;

    setProjectData((prev) => ({
      ...prev,
      contentBlocks: [...prev.contentBlocks, newBlock],
    }));
    setShowAddBlock(false);
  };

  const updateBlock = (updatedBlock: ContentBlock) => {
    setProjectData((prev) => ({
      ...prev,
      contentBlocks: prev.contentBlocks.map((block) =>
        block.id === updatedBlock.id ? updatedBlock : block
      ),
    }));
  };

  const deleteBlock = (blockId: string) => {
    setProjectData((prev) => ({
      ...prev,
      contentBlocks: prev.contentBlocks
        .filter((block) => block.id !== blockId)
        .map((block, index) => ({ ...block, order: index })),
    }));
  };

  const reorderBlocks = (fromIndex: number, toIndex: number) => {
    setProjectData((prev) => {
      const newBlocks = [...prev.contentBlocks];
      const [movedBlock] = newBlocks.splice(fromIndex, 1);
      newBlocks.splice(toIndex, 0, movedBlock);

      return {
        ...prev,
        contentBlocks: newBlocks.map((block, index) => ({
          ...block,
          order: index,
        })),
      };
    });
  };

  const loadTemplate = (template: (typeof DEFAULT_TEMPLATES)[0]) => {
    const templateBlocks = template.contentBlocks.map((block, index) => ({
      ...block,
      id: generateId(),
      order: index,
    })) as ContentBlock[];

    setProjectData((prev) => ({
      ...prev,
      contentBlocks: templateBlocks,
    }));
    setShowTemplates(false);
  };

  const handleSave = () => {
    if (onSave) {
      onSave({
        ...projectData,
        updatedAt: new Date().toISOString(),
      });
    }
  };

  const blockTypes: { type: ContentBlockType; label: string; icon: string }[] =
    [
      { type: "text", label: "Text", icon: "📝" },
      { type: "image", label: "Image", icon: "🖼️" },
      { type: "image-gallery", label: "Gallery", icon: "🖼️" },
      { type: "quote", label: "Quote", icon: "💬" },
      { type: "spacer", label: "Spacer", icon: "📏" },
    ];

  return (
    <div className="project-builder min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-gray-900">
              {projectData.title || "New Project"}
            </h1>
            <div className="flex gap-2">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className={`px-3 py-1 rounded text-sm ${
                  isEditing
                    ? "bg-blue-100 text-blue-700"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {isEditing ? "Preview" : "Edit"}
              </button>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowTemplates(true)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
            >
              Templates
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Save Project
            </button>
          </div>
        </div>
      </div>

      {/* Project Info */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Project Title
              </label>
              <input
                type="text"
                value={projectData.title}
                onChange={(e) =>
                  setProjectData((prev) => ({ ...prev, title: e.target.value }))
                }
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="Enter project title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Slug
              </label>
              <input
                type="text"
                value={projectData.slug}
                onChange={(e) =>
                  setProjectData((prev) => ({ ...prev, slug: e.target.value }))
                }
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="project-slug"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <input
                type="text"
                value={projectData.description || ""}
                onChange={(e) =>
                  setProjectData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="Brief description"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <input
                type="text"
                value={projectData.location || ""}
                onChange={(e) =>
                  setProjectData((prev) => ({
                    ...prev,
                    location: e.target.value,
                  }))
                }
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="Where was this shot?"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-6xl mx-auto p-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 min-h-[600px]">
          {projectData.contentBlocks.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-96 text-gray-500">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-xl font-medium mb-2">
                No content blocks yet
              </h3>
              <p className="text-sm mb-4">
                Start building your project by adding content blocks
              </p>
              <button
                onClick={() => setShowAddBlock(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Add First Block
              </button>
            </div>
          ) : (
            <div className="p-6 space-y-6">
              {projectData.contentBlocks
                .sort((a, b) => a.order - b.order)
                .map((block, index) => (
                  <DragDropBlock
                    key={block.id}
                    block={block}
                    index={index}
                    isEditing={isEditing}
                    onUpdate={updateBlock}
                    onDelete={deleteBlock}
                    onReorder={reorderBlocks}
                    onImageUpload={onImageUpload}
                  />
                ))}
            </div>
          )}

          {/* Add Block Button */}
          {isEditing && (
            <div className="p-6 border-t border-gray-200">
              <button
                onClick={() => setShowAddBlock(true)}
                className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors"
              >
                + Add Content Block
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Add Block Modal */}
      {showAddBlock && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-medium mb-4">Add Content Block</h3>
            <div className="grid grid-cols-2 gap-3">
              {blockTypes.map(({ type, label, icon }) => (
                <button
                  key={type}
                  onClick={() => addBlock(type)}
                  className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                >
                  <div className="text-2xl mb-2">{icon}</div>
                  <div className="text-sm font-medium">{label}</div>
                </button>
              ))}
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setShowAddBlock(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Templates Modal */}
      {showTemplates && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4">
            <h3 className="text-lg font-medium mb-4">Choose a Template</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {DEFAULT_TEMPLATES.map((template) => (
                <button
                  key={template.id}
                  onClick={() => loadTemplate(template)}
                  className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-left"
                >
                  <h4 className="font-medium mb-2">{template.name}</h4>
                  <p className="text-sm text-gray-600">
                    {template.description}
                  </p>
                </button>
              ))}
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setShowTemplates(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
