'use client';

import { useState, useEffect } from 'react';
import { Tab } from '@headlessui/react';
import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showThumbnails, setShowThumbnails] = useState(false);
  
  // Sample photography images - replace with your actual images
  const images = [
    {
      src: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      alt: 'Architectural Photography'
    },
    {
      src: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      alt: 'Urban Landscape'
    },
    {
      src: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      alt: 'Modern Architecture'
    },
    {
      src: 'https://images.unsplash.com/photo-1511818966892-d7d671e672a2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2071&q=80',
      alt: 'Industrial Design'
    },
    {
      src: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      alt: 'Abstract Architecture'
    }
  ];

  // Auto-advance slideshow (only when not showing thumbnails)
  useEffect(() => {
    if (!showThumbnails) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % images.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [images.length, showThumbnails]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % images.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + images.length) % images.length);
  };

  const selectImage = (index: number) => {
    setCurrentSlide(index);
    setShowThumbnails(false);
  };

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
            <li><Link href="/projects">Projects</Link></li>
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

        {/* Sidebar Controls */}
        <div className="sidebar-controls">
          <Tab.Group>
            <Tab.List className="sidebar-tab-list">
              <Tab className="sidebar-tab" onClick={prevSlide}>
                PREV
              </Tab>
              <Tab className="sidebar-tab" onClick={nextSlide}>
                NEXT
              </Tab>
              <Tab className="sidebar-tab" onClick={() => setShowThumbnails(!showThumbnails)}>
                {showThumbnails ? 'BACK TO SLIDESHOW' : 'SHOW THUMBNAILS'}
              </Tab>
            </Tab.List>
          </Tab.Group>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {!showThumbnails ? (
          /* Slideshow View */
          <section className="gallery-container">
            {images.map((image, index) => (
              <div
                key={index}
                className={`gallery-slide ${index === currentSlide ? 'active' : ''}`}
                style={{
                  backgroundImage: `url(${image.src})`,
                }}
              />
            ))}
            
            {/* Gallery Controls */}
            <button
              className="gallery-controls gallery-prev"
              onClick={prevSlide}
              aria-label="Previous image"
            >
              ‹
            </button>
            <button
              className="gallery-controls gallery-next"
              onClick={nextSlide}
              aria-label="Next image"
            >
              ›
            </button>
          </section>
        ) : (
          /* Thumbnail Grid View */
          <section className="thumbnail-grid-container">
            <div className="thumbnail-grid">
              {images.map((image, index) => (
                <div
                  key={index}
                  className={`thumbnail-item ${index === currentSlide ? 'active' : ''}`}
                  onClick={() => selectImage(index)}
                >
                  <Image
                    src={image.src}
                    alt={image.alt}
                    className="thumbnail-image"
                    width={400}
                    height={300}
                    style={{ objectFit: 'cover' }}
                  />
                </div>
              ))}
            </div>
          </section>
        )}


        {/* Content Section */}
        <section className="content-section">
          <div className="content-text">
            <h1>Portfolio</h1>
            <p>
              <strong>CJ Photography</strong> specializes in architectural and commercial photography, 
              capturing the essence of modern design and urban landscapes. Our work focuses on 
              the interplay between light, form, and space, creating compelling visual narratives 
              that showcase the beauty of contemporary architecture.
            </p>
            <p>
              Based in Los Angeles, we work with architects, developers, and design firms to 
              create stunning visual content that tells the story of exceptional spaces. 
              Our approach combines technical precision with artistic vision, ensuring that 
              each photograph not only documents but elevates the subject matter.
            </p>
            <p>
              From sleek corporate headquarters to innovative residential projects, we bring 
              a fresh perspective to architectural photography, highlighting the unique 
              character and craftsmanship of each project we document.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
