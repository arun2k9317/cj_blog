"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";

export interface ImageLightboxProps {
  images: string[];
  currentIndex: number;
  projectInfo?: {
    title: string;
    description?: string;
    location?: string;
    [key: string]: any;
  };
  isOpen: boolean;
  onClose: () => void;
  onImageChange?: (index: number) => void;
}

export default function ImageLightbox({
  images,
  currentIndex: initialIndex,
  projectInfo,
  isOpen,
  onClose,
  onImageChange,
}: ImageLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [showThumbnails, setShowThumbnails] = useState(true);
  const [showInfo, setShowInfo] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      if (isFullscreen) {
        document.documentElement.requestFullscreen?.();
      }
    } else {
      document.body.style.overflow = "";
      if (document.fullscreenElement) {
        document.exitFullscreen?.();
      }
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen, isFullscreen]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  const handlePrevious = useCallback(() => {
    const newIndex = currentIndex > 0 ? currentIndex - 1 : images.length - 1;
    setCurrentIndex(newIndex);
    onImageChange?.(newIndex);
  }, [currentIndex, images.length, onImageChange]);

  const handleNext = useCallback(() => {
    const newIndex = currentIndex < images.length - 1 ? currentIndex + 1 : 0;
    setCurrentIndex(newIndex);
    onImageChange?.(newIndex);
  }, [currentIndex, images.length, onImageChange]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowLeft":
          handlePrevious();
          break;
        case "ArrowRight":
          handleNext();
          break;
        case "Escape":
          onClose();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, handlePrevious, handleNext, onClose]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  if (!isOpen) return null;

  const currentImage = images[currentIndex];

  return (
    <div
      className={`image-lightbox ${isDarkMode ? "dark-mode" : ""} ${
        isFullscreen ? "fullscreen" : ""
      }`}
    >
      {/* Close Button */}
      <button
        className="lightbox-close"
        onClick={onClose}
        aria-label="Close lightbox"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>

      {/* Main Image Container */}
      <div className="lightbox-main-container">
        <div className="lightbox-image-wrapper">
          <Image
            src={currentImage}
            alt={`${projectInfo?.title || "Image"} - ${currentIndex + 1}`}
            fill
            className="lightbox-main-image"
            priority
            quality={90}
            sizes="100vw"
          />
        </div>

        {/* Navigation Arrows */}
        <button
          className="lightbox-nav lightbox-nav-prev"
          onClick={handlePrevious}
          aria-label="Previous image"
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
        <button
          className="lightbox-nav lightbox-nav-next"
          onClick={handleNext}
          aria-label="Next image"
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
      </div>

      {/* Info Panel */}
      {showInfo && projectInfo && (
        <div className="lightbox-info-panel">
          <div className="lightbox-info-content">
            <h2 className="lightbox-info-title">{projectInfo.title}</h2>
            {projectInfo.description && (
              <p className="lightbox-info-description">{projectInfo.description}</p>
            )}
            {projectInfo.location && (
              <p className="lightbox-info-location">{projectInfo.location}</p>
            )}
          </div>
        </div>
      )}

      {/* Thumbnails */}
      {showThumbnails && (
        <div className="lightbox-thumbnails">
          {images.map((img, index) => (
            <button
              key={index}
              className={`lightbox-thumbnail ${
                index === currentIndex ? "active" : ""
              }`}
              onClick={() => {
                setCurrentIndex(index);
                onImageChange?.(index);
              }}
              aria-label={`Go to image ${index + 1}`}
            >
              <Image
                src={img}
                alt={`Thumbnail ${index + 1}`}
                fill
                className="lightbox-thumbnail-image"
                sizes="(max-width: 768px) 60px, 80px"
              />
            </button>
          ))}
        </div>
      )}

      {/* Control Bar */}
      <div className="lightbox-controls">
        <button
          className="lightbox-control-btn"
          onClick={() => setShowThumbnails(!showThumbnails)}
          aria-label={showThumbnails ? "Hide thumbnails" : "Show thumbnails"}
        >
          {showThumbnails ? "Hide Thumbnails" : "Show Thumbnails"}
        </button>

        <button
          className="lightbox-control-btn"
          onClick={() => setShowInfo(!showInfo)}
          aria-label={showInfo ? "Hide info" : "Show info"}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
          <span>Info</span>
        </button>

        <button
          className="lightbox-control-btn"
          onClick={() => setIsDarkMode(!isDarkMode)}
          aria-label={isDarkMode ? "Light mode" : "Dark mode"}
        >
          {isDarkMode ? "☀️ Light" : "🌙 Dark"}
        </button>

        <button
          className="lightbox-control-btn lightbox-fullscreen-btn"
          onClick={toggleFullscreen}
          aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
        >
          {isFullscreen ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"></path>
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
            </svg>
          )}
          <span>{isFullscreen ? "Exit Fullscreen" : "Fullscreen"}</span>
        </button>
      </div>

      {/* Image Counter */}
      <div className="lightbox-counter">
        {currentIndex + 1} / {images.length}
      </div>
    </div>
  );
}

