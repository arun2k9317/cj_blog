"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { useTheme } from "@/contexts/ThemeContext";
import {
  IconX,
  IconChevronLeft,
  IconChevronRight,
  IconLayoutGrid,
  IconInfoCircle,
  IconMaximize,
  IconMinimize,
} from "@tabler/icons-react";

export interface ImageLightboxProps {
  images: string[];
  currentIndex: number;
  projectInfo?: {
    title: string;
    description?: string;
    location?: string;
    [key: string]: unknown;
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
  const { theme, toggleTheme } = useTheme();
  const isDarkMode = theme === "dark";
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [showThumbnails, setShowThumbnails] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMagnifierOn] = useState(false);
  const [isLensVisible, setIsLensVisible] = useState(false);
  const [lensPosition, setLensPosition] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const [zoomFactor] = useState(2);
  const [lensSize] = useState(240);
  const imageWrapperRef = useRef<HTMLDivElement | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const minZoom = 1;
  const maxZoom = 3;
  const zoomStep = 0.1;
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const isPanningRef = useRef(false);
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const panAtDragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      if (document.fullscreenElement) {
        // Best-effort exit when closing
        document.exitFullscreen?.().catch(() => {});
      }
      setIsFullscreen(false);
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

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

  const toggleFullscreen = async () => {
    // Ensure environment supports fullscreen
    if (typeof document === "undefined" || !document.fullscreenEnabled) {
      return;
    }

    const lightboxElement = document.querySelector(
      ".image-lightbox"
    ) as HTMLElement | null;

    try {
      if (!document.fullscreenElement) {
        await lightboxElement?.requestFullscreen?.();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen?.();
        setIsFullscreen(false);
      }
    } catch (error) {
      // Swallow permission errors gracefully and sync state with actual fullscreen
      console.error("Fullscreen toggle failed:", error);
      setIsFullscreen(!!document.fullscreenElement);
    }
  };

  // Reset magnifier when image changes or lightbox closes
  useEffect(() => {
    setIsLensVisible(false);
  }, [currentIndex, isOpen]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isMagnifierOn) return;
    const wrapper = imageWrapperRef.current;
    if (!wrapper) return;
    const rect = wrapper.getBoundingClientRect();
    const relativeX = e.clientX - rect.left;
    const relativeY = e.clientY - rect.top;
    const clampedX = Math.max(0, Math.min(rect.width, relativeX));
    const clampedY = Math.max(0, Math.min(rect.height, relativeY));
    setLensPosition({ x: clampedX, y: clampedY });
  };

  const handleMouseEnter = () => {
    if (isMagnifierOn) setIsLensVisible(true);
  };

  const handleMouseLeave = () => {
    setIsLensVisible(false);
  };

  const clampZoom = (value: number) => {
    return Math.max(minZoom, Math.min(maxZoom, value));
  };

  const handleWheelOnZoom = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const delta = e.deltaY;
    const next = clampZoom(zoomLevel + (delta < 0 ? zoomStep : -zoomStep));
    setZoomLevel(parseFloat(next.toFixed(2)));
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setZoomLevel(clampZoom(val));
  };

  // Reset pan when zooming back to 1x or image changes
  useEffect(() => {
    if (zoomLevel <= 1.001) {
      setPanOffset({ x: 0, y: 0 });
      setIsPanning(false);
      isPanningRef.current = false;
    }
  }, [zoomLevel, currentIndex]);

  const clampPan = (desired: {
    x: number;
    y: number;
  }): { x: number; y: number } => {
    const wrapper = imageWrapperRef.current;
    if (!wrapper) return desired;
    const width = wrapper.clientWidth;
    const height = wrapper.clientHeight;
    const scaledWidth = width * zoomLevel;
    const scaledHeight = height * zoomLevel;
    const maxX = Math.max(0, (scaledWidth - width) / 2);
    const maxY = Math.max(0, (scaledHeight - height) / 2);
    return {
      x: Math.max(-maxX, Math.min(maxX, desired.x)),
      y: Math.max(-maxY, Math.min(maxY, desired.y)),
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (zoomLevel <= 1) return;
    const el = e.currentTarget as HTMLDivElement;
    // Only start panning on primary button/touch
    if (e.button !== undefined && e.button !== 0) return;
    el.setPointerCapture?.(e.pointerId);
    isPanningRef.current = true;
    setIsPanning(true);
    panStartRef.current = { x: e.clientX, y: e.clientY };
    panAtDragStartRef.current = { ...panOffset };
  };

  const endPan = (
    currentTarget?: (EventTarget & HTMLDivElement) | null,
    pointerId?: number
  ) => {
    try {
      if (currentTarget && pointerId !== undefined) {
        if (currentTarget.hasPointerCapture?.(pointerId)) {
          currentTarget.releasePointerCapture?.(pointerId);
        }
      }
    } catch {
      // noop – releasePointerCapture may throw if pointer already ended
    }
    isPanningRef.current = false;
    setIsPanning(false);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    endPan(e.currentTarget, e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isPanningRef.current) return;
    const deltaX = e.clientX - panStartRef.current.x;
    const deltaY = e.clientY - panStartRef.current.y;
    const next = clampPan({
      x: panAtDragStartRef.current.x + deltaX,
      y: panAtDragStartRef.current.y + deltaY,
    });
    setPanOffset(next);
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
        <IconX size={24} />
      </button>

      {/* Main Image Container */}
      <div className="lightbox-main-container">
        <div
          className="lightbox-image-wrapper"
          ref={imageWrapperRef}
          onMouseMove={handleMouseMove}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={() => {
            handleMouseLeave();
            endPan();
          }}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerMove={handlePointerMove}
          style={{
            cursor:
              zoomLevel > 1 ? (isPanning ? "grabbing" : "grab") : "default",
          }}
        >
          <Image
            src={currentImage}
            alt={`${projectInfo?.title || "Image"} - ${currentIndex + 1}`}
            fill
            className="lightbox-main-image"
            style={{
              transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
              transformOrigin: "center center",
              transition: "transform 0.2s ease",
            }}
            priority
            quality={90}
            sizes="100vw"
          />
          {isMagnifierOn && isLensVisible && imageWrapperRef.current && (
            <div
              className="lightbox-magnifier-lens"
              style={{
                width: `${lensSize}px`,
                height: `${lensSize}px`,
                left: `${lensPosition.x - lensSize / 2}px`,
                top: `${lensPosition.y - lensSize / 2}px`,
                backgroundImage: `url(${currentImage})`,
                backgroundRepeat: "no-repeat",
                // background-size scaled based on container size
                backgroundSize: `${
                  (imageWrapperRef.current?.clientWidth || 1) * zoomFactor
                }px ${
                  (imageWrapperRef.current?.clientHeight || 1) * zoomFactor
                }px`,
                backgroundPosition: `${-(
                  lensPosition.x * zoomFactor -
                  lensSize / 2
                )}px ${-(lensPosition.y * zoomFactor - lensSize / 2)}px`,
              }}
            />
          )}
        </div>

        {/* Navigation Arrows */}
        <button
          className="lightbox-nav lightbox-nav-prev"
          onClick={handlePrevious}
          aria-label="Previous image"
        >
          <IconChevronLeft size={32} />
        </button>
        <button
          className="lightbox-nav lightbox-nav-next"
          onClick={handleNext}
          aria-label="Next image"
        >
          <IconChevronRight size={32} />
        </button>
      </div>

      {/* Info Panel */}
      {showInfo && projectInfo && (
        <div className="lightbox-info-panel">
          <div className="lightbox-info-content">
            <h2 className="lightbox-info-title">{projectInfo.title}</h2>
            {projectInfo.description && (
              <p className="lightbox-info-description">
                {projectInfo.description}
              </p>
            )}
            {projectInfo.location && (
              <p className="lightbox-info-location">{projectInfo.location}</p>
            )}
          </div>
        </div>
      )}

      {/* Thumbnails Grid Overlay */}
      {showThumbnails && (
        <div
          className="lightbox-thumb-grid"
          role="dialog"
          aria-label="Thumbnails grid"
        >
          {images.map((img, index) => (
            <button
              key={index}
              className={`thumb-grid-item ${
                index === currentIndex ? "active" : ""
              }`}
              onClick={() => {
                setCurrentIndex(index);
                onImageChange?.(index);
                setShowThumbnails(false);
              }}
              aria-label={`Open image ${index + 1}`}
            >
              <Image
                src={img}
                alt={`Thumbnail ${index + 1}`}
                fill
                className="thumb-grid-image"
                sizes="(max-width: 1200px) 33vw, 280px"
                priority={index < 6}
              />
            </button>
          ))}
        </div>
      )}

      {/* Control Bar removed */}

      {/* Image Counter */}
      <div className="lightbox-counter">
        {currentIndex + 1} / {images.length}
      </div>

      {/* Side Controls (top-right under close button) */}
      <div className="lightbox-side-controls">
        <button
          className="lightbox-control-btn with-tooltip"
          onClick={() => setShowThumbnails(!showThumbnails)}
          aria-label={showThumbnails ? "Hide thumbnails" : "Show thumbnails"}
          data-tooltip={showThumbnails ? "Hide thumbnails" : "Show thumbnails"}
        >
          <IconLayoutGrid size={18} />
        </button>
        <button
          className="lightbox-control-btn with-tooltip"
          onClick={() => setShowInfo(!showInfo)}
          aria-label={showInfo ? "Hide info" : "Show info"}
          data-tooltip={showInfo ? "Hide info" : "Show info"}
        >
          <IconInfoCircle size={18} />
        </button>
        {/* <button
          className="lightbox-control-btn with-tooltip"
          onClick={() => setIsMagnifierOn((v) => !v)}
          aria-label={isMagnifierOn ? "Disable magnifier" : "Enable magnifier"}
          data-tooltip={
            isMagnifierOn ? "Disable magnifier" : "Enable magnifier"
          }
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="7"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </button> */}
        {/* Theme switch */}
        <label
          className="lightbox-switch with-tooltip"
          data-tooltip={
            isDarkMode ? "Switch to light mode" : "Switch to dark mode"
          }
        >
          <input
            type="checkbox"
            checked={isDarkMode}
            onChange={(e) => {
              toggleTheme();
              e.currentTarget.blur();
            }}
            aria-label="Toggle dark mode"
          />
          <span className="lightbox-switch-slider" />
        </label>
        <button
          className="lightbox-control-btn lightbox-fullscreen-btn with-tooltip"
          onClick={toggleFullscreen}
          aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          data-tooltip={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
        >
          {isFullscreen ? (
            <IconMinimize size={18} />
          ) : (
            <IconMaximize size={18} />
          )}
        </button>
      </div>

      {/* Zoom Scroller (top-right) */}
      <div
        className="lightbox-zoom-control with-tooltip"
        data-tooltip={`${Math.round(
          ((zoomLevel - minZoom) / (maxZoom - minZoom)) * 100
        )}% zoom`}
        onWheel={handleWheelOnZoom}
        aria-label="Zoom control"
        role="group"
      >
        <input
          className="zoom-slider"
          type="range"
          min={minZoom}
          max={maxZoom}
          step={zoomStep}
          value={zoomLevel}
          onChange={handleSliderChange}
          aria-label="Zoom level"
        />
      </div>
    </div>
  );
}
