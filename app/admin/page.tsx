'use client';

import { useState } from 'react';
import ImageManager from '@/components/ImageManager';

export default function AdminPage() {
  const [selectedProject, setSelectedProject] = useState('carla-ridge-residence');
  const [projectImages, setProjectImages] = useState<Record<string, string[]>>({
    'carla-ridge-residence': [],
    'under-restaurant': [],
    'forest-knoll': [],
    'twisting-tower': [],
    'urban-landscape': [],
    'textured-facade': [],
  });

  const projects = [
    { id: 'carla-ridge-residence', name: 'Carla Ridge Residence' },
    { id: 'under-restaurant', name: 'Under Restaurant' },
    { id: 'forest-knoll', name: 'Forest Knoll' },
    { id: 'twisting-tower', name: 'Twisting Tower' },
    { id: 'urban-landscape', name: 'Urban Landscape' },
    { id: 'textured-facade', name: 'Textured Facade' },
  ];

  const handleImagesChange = (projectId: string, images: string[]) => {
    setProjectImages(prev => ({
      ...prev,
      [projectId]: images
    }));
  };

  const exportProjectData = () => {
    const data = {
      projects: Object.entries(projectImages).map(([projectId, images]) => ({
        id: projectId,
        name: projects.find(p => p.id === projectId)?.name || projectId,
        images
      }))
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'project-images.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>Image Management</h1>
        <div className="admin-actions">
          <button onClick={exportProjectData} className="export-btn">
            Export Project Data
          </button>
        </div>
      </div>

      <div className="admin-content">
        <div className="project-selector">
          <label htmlFor="project-select">Select Project:</label>
          <select
            id="project-select"
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="project-select"
          >
            {projects.map(project => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>

        <div className="project-info">
          <h2>{projects.find(p => p.id === selectedProject)?.name}</h2>
          <p>Project ID: {selectedProject}</p>
          <p>Images: {projectImages[selectedProject]?.length || 0}</p>
        </div>

        <ImageManager
          projectId={selectedProject}
          existingImages={projectImages[selectedProject] || []}
          onImagesChange={(images) => handleImagesChange(selectedProject, images)}
          maxImages={20}
        />
      </div>

      <style jsx>{`
        .admin-page {
          min-height: 100vh;
          background-color: #f5f5f5;
          padding: 2rem;
        }

        .admin-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid #ddd;
        }

        .admin-header h1 {
          margin: 0;
          color: #333;
          font-size: 2rem;
        }

        .admin-actions {
          display: flex;
          gap: 1rem;
        }

        .export-btn {
          background-color: #0070f3;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.9rem;
          transition: background-color 0.2s ease;
        }

        .export-btn:hover {
          background-color: #0051cc;
        }

        .admin-content {
          max-width: 1200px;
          margin: 0 auto;
        }

        .project-selector {
          margin-bottom: 2rem;
          padding: 1.5rem;
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .project-selector label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 600;
          color: #333;
        }

        .project-select {
          width: 100%;
          max-width: 400px;
          padding: 0.75rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 1rem;
          background: white;
        }

        .project-info {
          margin-bottom: 2rem;
          padding: 1.5rem;
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .project-info h2 {
          margin: 0 0 0.5rem 0;
          color: #333;
        }

        .project-info p {
          margin: 0.25rem 0;
          color: #666;
        }
      `}</style>
    </div>
  );
}
