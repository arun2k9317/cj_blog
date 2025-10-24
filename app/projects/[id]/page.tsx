'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import ProjectRenderer from '@/components/ProjectRenderer';
import { Project } from '@/types/project';

// Sample project data - in a real app, this would come from a CMS or API
const projectsData = {
  'carla-ridge-residence': {
    id: 'carla-ridge-residence',
    title: 'Carla Ridge Residence',
    location: 'Los Angeles, CA',
    architect: 'Walker Workshop',
    description: 'Modern hillside residence with extensive outdoor living spaces and panoramic city views.',
    images: [
      'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      'https://images.unsplash.com/photo-1511818966892-d7d671e672a2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2071&q=80',
      'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80'
    ]
  },
  'under-restaurant': {
    id: 'under-restaurant',
    title: 'Under',
    location: 'Lindesnes, Norway',
    architect: 'Snøhetta',
    description: 'Underwater restaurant offering a unique dining experience beneath the ocean surface.',
    images: [
      'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      'https://images.unsplash.com/photo-1511818966892-d7d671e672a2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2071&q=80'
    ]
  },
  'forest-knoll': {
    id: 'forest-knoll',
    title: 'Forest Knoll',
    location: 'Los Angeles, CA',
    architect: 'Standard Architects',
    description: 'Contemporary residential development featuring innovative gabled roof designs.',
    images: [
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      'https://images.unsplash.com/photo-1511818966892-d7d671e672a2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2071&q=80',
      'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80'
    ]
  },
  'twisting-tower': {
    id: 'twisting-tower',
    title: 'Twisting Tower',
    location: 'New York, NY',
    architect: 'BIG Architects',
    description: 'Iconic skyscraper with a distinctive twisting form that creates dynamic facades.',
    images: [
      'https://images.unsplash.com/photo-1511818966892-d7d671e672a2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2071&q=80',
      'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80'
    ]
  },
  'urban-landscape': {
    id: 'urban-landscape',
    title: 'Urban Landscape',
    location: 'Chicago, IL',
    architect: 'SOM',
    description: 'Comprehensive urban development project integrating residential and commercial spaces.',
    images: [
      'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      'https://images.unsplash.com/photo-1511818966892-d7d671e672a2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2071&q=80',
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80'
    ]
  },
  'textured-facade': {
    id: 'textured-facade',
    title: 'Textured Facade',
    location: 'Miami, FL',
    architect: 'Zaha Hadid Architects',
    description: 'Innovative building design featuring dynamic textured facades and organic forms.',
    images: [
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      'https://images.unsplash.com/photo-1511818966892-d7d671e672a2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2071&q=80',
      'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80'
    ]
  }
};

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = params.id as string;
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showThumbnails, setShowThumbnails] = useState(false);
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
          // Fallback to static data
          const staticProject = projectsData[projectId as keyof typeof projectsData];
          if (staticProject) {
            // Convert static project to new format
            const convertedProject: Project = {
              id: staticProject.id,
              title: staticProject.title,
              slug: staticProject.id,
              description: staticProject.description,
              location: staticProject.location,
              architect: staticProject.architect,
              contentBlocks: [
                {
                  id: '1',
                  type: 'text',
                  order: 0,
                  content: staticProject.title,
                  textAlign: 'center',
                  fontSize: 'xlarge',
                  fontWeight: 'bold'
                },
                {
                  id: '2',
                  type: 'text',
                  order: 1,
                  content: `${staticProject.location} • ${staticProject.architect}`,
                  textAlign: 'center',
                  fontSize: 'medium',
                  fontWeight: 'normal'
                },
                {
                  id: '3',
                  type: 'spacer',
                  order: 2,
                  height: 2
                },
                {
                  id: '4',
                  type: 'text',
                  order: 3,
                  content: staticProject.description,
                  textAlign: 'left',
                  fontSize: 'medium',
                  fontWeight: 'normal'
                },
                ...staticProject.images.map((image, index) => ({
                  id: `img-${index + 5}`,
                  type: 'image' as const,
                  order: index + 4,
                  src: image,
                  alt: `${staticProject.title} - Image ${index + 1}`,
                  alignment: 'center' as const,
                  aspectRatio: 'landscape' as const
                }))
              ],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              published: true
            };
            setProject(convertedProject);
          }
        }
      } catch (error) {
        console.error('Error fetching project:', error);
        // Fallback to static data
        const staticProject = projectsData[projectId as keyof typeof projectsData];
        if (staticProject) {
          // Convert static project to new format (same as above)
          const convertedProject: Project = {
            id: staticProject.id,
            title: staticProject.title,
            slug: staticProject.id,
            description: staticProject.description,
            location: staticProject.location,
            architect: staticProject.architect,
            contentBlocks: [
              {
                id: '1',
                type: 'text',
                order: 0,
                content: staticProject.title,
                textAlign: 'center',
                fontSize: 'xlarge',
                fontWeight: 'bold'
              },
              {
                id: '2',
                type: 'text',
                order: 1,
                content: `${staticProject.location} • ${staticProject.architect}`,
                textAlign: 'center',
                fontSize: 'medium',
                fontWeight: 'normal'
              },
              {
                id: '3',
                type: 'spacer',
                order: 2,
                height: 2
              },
              {
                id: '4',
                type: 'text',
                order: 3,
                content: staticProject.description,
                textAlign: 'left',
                fontSize: 'medium',
                fontWeight: 'normal'
              },
              ...staticProject.images.map((image, index) => ({
                id: `img-${index + 5}`,
                type: 'image' as const,
                order: index + 4,
                src: image,
                alt: `${staticProject.title} - Image ${index + 1}`,
                alignment: 'center' as const,
                aspectRatio: 'landscape' as const
              }))
            ],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            published: true
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
      <div className="main-layout">
        <aside className="sidebar">
          <div className="sidebar-logo">CJ PHOTOGRAPHY</div>
          <nav>
            <ul className="sidebar-nav">
              <li><Link href="/">Portfolio</Link></li>
              <li><Link href="/projects">Projects</Link></li>
              <li><Link href="/art">Art</Link></li>
              <li><Link href="/about">About</Link></li>
              <li><Link href="/books">Books</Link></li>
              <li><Link href="/print-shop">Print Shop</Link></li>
              <li><Link href="/contact">Contact</Link></li>
            </ul>
          </nav>
        </aside>
        <main className="main-content">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
              <p>Loading project...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="main-layout">
        <aside className="sidebar">
          <div className="sidebar-logo">CJ PHOTOGRAPHY</div>
          <nav>
            <ul className="sidebar-nav">
              <li><Link href="/">Portfolio</Link></li>
              <li><Link href="/projects">Projects</Link></li>
              <li><Link href="/art">Art</Link></li>
              <li><Link href="/about">About</Link></li>
              <li><Link href="/books">Books</Link></li>
              <li><Link href="/print-shop">Print Shop</Link></li>
              <li><Link href="/contact">Contact</Link></li>
            </ul>
          </nav>
        </aside>
        <main className="main-content">
          <div className="project-not-found">
            <h1>Project Not Found</h1>
            <p>The project you&apos;re looking for doesn&apos;t exist.</p>
            <Link href="/projects" className="back-to-projects">← Back to Projects</Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="main-layout">
      {/* Left Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          CJ PHOTOGRAPHY
        </div>
        
        <nav>
          <ul className="sidebar-nav">
            <li><Link href="/">Portfolio</Link></li>
            <li><Link href="/projects" className="active">Projects</Link></li>
            <li><Link href="/art">Art</Link></li>
            <li><Link href="/about">About</Link></li>
            <li><Link href="/books">Books</Link></li>
            <li><Link href="/print-shop">Print Shop</Link></li>
            <li><Link href="/contact">Contact</Link></li>
          </ul>
        </nav>
        
        <div className="sidebar-social">
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.948-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
          </a>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <div className="max-w-4xl mx-auto p-6">
          <ProjectRenderer project={project} />
          
          {/* Back to Projects Link */}
          <div className="mt-8 text-center">
            <Link href="/projects" className="back-to-projects">← Back to Projects</Link>
          </div>
        </div>
      </main>
    </div>
  );
}
