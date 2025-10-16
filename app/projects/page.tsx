'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

// Sample project data - replace with your actual projects
const projects = [
  {
    id: 'carla-ridge-residence',
    title: 'Carla Ridge Residence',
    location: 'Los Angeles, CA',
    architect: 'Walker Workshop',
    thumbnail: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    description: 'Modern hillside residence with extensive outdoor living spaces and panoramic city views.'
  },
  {
    id: 'under-restaurant',
    title: 'Under',
    location: 'Lindesnes, Norway',
    architect: 'Snøhetta',
    thumbnail: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    description: 'Underwater restaurant offering a unique dining experience beneath the ocean surface.'
  },
  {
    id: 'forest-knoll',
    title: 'Forest Knoll',
    location: 'Los Angeles, CA',
    architect: 'Standard Architects',
    thumbnail: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    description: 'Contemporary residential development featuring innovative gabled roof designs.'
  },
  {
    id: 'twisting-tower',
    title: 'Twisting Tower',
    location: 'New York, NY',
    architect: 'BIG Architects',
    thumbnail: 'https://images.unsplash.com/photo-1511818966892-d7d671e672a2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2071&q=80',
    description: 'Iconic skyscraper with a distinctive twisting form that creates dynamic facades.'
  },
  {
    id: 'urban-landscape',
    title: 'Urban Landscape',
    location: 'Chicago, IL',
    architect: 'SOM',
    thumbnail: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    description: 'Comprehensive urban development project integrating residential and commercial spaces.'
  },
  {
    id: 'textured-facade',
    title: 'Textured Facade',
    location: 'Miami, FL',
    architect: 'Zaha Hadid Architects',
    thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    description: 'Innovative building design featuring dynamic textured facades and organic forms.'
  }
];

export default function ProjectsPage() {
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
        <div className="projects-container">
          <div className="projects-header">
            <h1>Projects</h1>
            <p>Architectural photography showcasing exceptional design and craftsmanship</p>
          </div>
          
          <div className="projects-grid">
            {projects.map((project) => (
              <Link key={project.id} href={`/projects/${project.id}`} className="project-card">
                <div className="project-image-container">
                  <Image
                    src={project.thumbnail}
                    alt={project.title}
                    className="project-thumbnail"
                    width={600}
                    height={400}
                    style={{ objectFit: 'cover' }}
                  />
                </div>
                <div className="project-info">
                  <h3 className="project-title">{project.title}</h3>
                  <p className="project-location">{project.location}</p>
                  <p className="project-architect">{project.architect}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
