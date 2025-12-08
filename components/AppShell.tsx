"use client";

import { useEffect, useMemo, useState, PropsWithChildren } from "react";
import { usePathname } from "next/navigation";
import { Box, Drawer, Burger } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import Sidebar from "@/components/Sidebar";
import MobileSidebar from "@/components/MobileSidebar";
import ImageLightbox from "@/components/ImageLightbox";
import MobileImageLightbox from "@/components/MobileImageLightbox";
import { BLOB_BASE, Series, projectsSeries, storiesSeries } from "@/lib/series";

export default function AppShell({ children }: PropsWithChildren) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin");
  const isViewingProjectOrStory = pathname?.startsWith("/view/project/") || pathname?.startsWith("/view/story/");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selectedSeriesId, setSelectedSeriesId] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Mobile detection (matches Mantine's sm breakpoint usually, or custom 768px)
  const isMobile = useMediaQuery("(max-width: 768px)");

  const allSeries = useMemo<Series[]>(() => [...projectsSeries, ...storiesSeries], []);

  const activeSeries: Series = useMemo(() => {
    const found = allSeries.find((s) => s.id === selectedSeriesId);
    return found ?? projectsSeries[0];
  }, [allSeries, selectedSeriesId]);

  const projectImages = useMemo(() => {
    const total = activeSeries.count;
    const ext = activeSeries.ext;
    return Array.from({ length: total }, (_, i) =>
      `${BLOB_BASE}/${activeSeries.folder}/${activeSeries.folder}_${i + 1}.${ext}`
    );
  }, [activeSeries]);

  // Demo captions for testing hover info panel
  const imageCaptions = useMemo(() => {
    // Generate demo captions based on series
    const captions: (string | undefined)[] = [];
    const total = activeSeries.count;
    
    if (activeSeries.id === "behindTheTeaCup") {
      // Demo captions for "Behind The Tea Cup" series
      const demoCaptions = [
        "A worker smiles among the tea plants, his weathered hands telling stories of years spent in the fields.",
        "Traditional houses dot the hillside, their architecture blending seamlessly with the terraced landscape.",
        "Endless rows of tea bushes stretch across the gentle slopes, creating patterns that echo the contours of the land.",
        "The morning mist clings to the valleys, softening the edges of the plantation and creating an ethereal atmosphere.",
        "A narrow dirt path winds through the plantation, connecting the fields to the processing facilities beyond.",
        "Small clusters of buildings emerge from the forested hills, housing the community that tends these fields.",
        "A worker moves through the rows, her silhouette framed by the golden rays of sunlight filtering through the clouds.",
        "Baskets filled with freshly plucked leaves are carried along the steep inclines, each step a testament to dedication.",
        "The terraced fields create dramatic diagonal patterns against the backdrop of distant mountains.",
        "In the quiet moments between labor, the true essence of the tea-growing tradition reveals itself.",
      ];
      for (let i = 0; i < total; i++) {
        captions.push(demoCaptions[i] || undefined);
      }
    } else if (activeSeries.id === "coffee-and-the-hills") {
      // Demo captions for "Coffee And The Hills" series
      const demoCaptions = [
        "Coffee plants thrive on the mountain slopes, their dark green leaves contrasting with the rich red soil.",
        "The morning harvest begins as workers carefully select the ripest cherries from each branch.",
        "Terraced fields cascade down the hillside, each level carefully maintained to maximize yield.",
        "A farmer inspects the coffee cherries, his experienced eye determining the perfect moment for picking.",
        "The processing facility stands at the edge of the plantation, where the transformation from cherry to bean begins.",
        "Sunlight filters through the coffee canopy, creating dappled patterns on the ground below.",
        "Workers move methodically through the rows, their movements synchronized with the rhythm of the harvest.",
        "The drying beds spread across the hillside, where coffee cherries are laid out to dry in the mountain air.",
        "Traditional tools are still used alongside modern techniques, preserving the heritage of coffee cultivation.",
        "The view from the highest point reveals the full expanse of the plantation, a testament to generations of care.",
        "A close-up of coffee cherries reveals their deep red color, a sign of perfect ripeness.",
        "The afternoon light casts long shadows across the terraces, highlighting the three-dimensional quality of the landscape.",
        "Workers gather at the end of the day, sharing stories and laughter as they prepare for the next morning's harvest.",
        "The coffee plants are pruned with precision, ensuring healthy growth and optimal fruit production.",
        "A path winds through the plantation, connecting the various sections and providing access for maintenance.",
        "The final image captures the essence of the series: the harmony between human labor and natural beauty.",
      ];
      for (let i = 0; i < total; i++) {
        captions.push(demoCaptions[i] || undefined);
      }
    } else {
      // For other series, add some generic demo captions
      for (let i = 0; i < total; i++) {
        captions.push(`A moment captured in time, revealing the beauty and complexity of this visual narrative.`);
      }
    }
    
    return captions;
  }, [activeSeries]);

  const projectInfo = {
    title: activeSeries.title,
    description: activeSeries.description,
    location: "",
  };

  const openLightboxForSeries = (seriesId: string | null) => {
    if (seriesId) setSelectedSeriesId(seriesId);
    setLightboxOpen(true);
    setActiveImageIndex(0); // Reset index when opening new series
    setMobileMenuOpen(false); // Close mobile menu if open
  };

  // Allow pages to open the lightbox via a DOM event without prop drilling
  useEffect(() => {
    const handler = (e: Event) => {
      const custom = e as CustomEvent<string | null>;
      openLightboxForSeries(custom.detail ?? null);
    };
    window.addEventListener("open-series-lightbox", handler as EventListener);
    return () => window.removeEventListener("open-series-lightbox", handler as EventListener);
  }, []);

  // For admin pages, render without sidebar/lightbox to provide a clean dashboard canvas
  if (isAdminRoute) {
    return (
      <Box className="main-layout">
        <Box component="main" className="main-content" style={{ marginLeft: 0 }}>{children}</Box>
      </Box>
    );
  }

  // For project/story viewer pages, render without sidebar (fullscreen view)
  if (isViewingProjectOrStory) {
    return (
      <Box className="main-layout">
        <Box component="main" className="main-content" style={{ marginLeft: 0 }}>{children}</Box>
      </Box>
    );
  }

  return (
    <Box className={`main-layout ${isSidebarCollapsed && !isMobile ? "sidebar-collapsed" : ""}`}>
      {isMobile ? (
        <>
          {/* Mobile Header */}
          <Box
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              height: "60px",
              display: "flex",
              alignItems: "center",
              padding: "0 16px",
              zIndex: 1000,
              backgroundColor: "var(--mantine-color-body)",
              borderBottom: "1px solid var(--mantine-color-default-border)",
            }}
          >
            <Burger
              opened={mobileMenuOpen}
              onClick={() => setMobileMenuOpen((o) => !o)}
              size="sm"
            />
            <Box style={{ flex: 1, textAlign: "center", fontWeight: 600 }}>
              Nitin Jamdar
            </Box>
            <Box style={{ width: 24 }} /> {/* Spacer for balance */}
          </Box>

          {/* Mobile Navigation Drawer */}
          <Drawer
            opened={mobileMenuOpen}
            onClose={() => setMobileMenuOpen(false)}
            size="75%"
            padding="md"
            title="Menu"
            zIndex={1100}
            styles={{
              content: { backgroundColor: "var(--mantine-color-body)" },
              header: { backgroundColor: "var(--mantine-color-body)" },
              title: { color: "var(--mantine-color-text)" },
              close: { color: "var(--mantine-color-text)" }
            }}
          >
            <MobileSidebar
              onClose={() => setMobileMenuOpen(false)}
              onOpenLightboxWithSeries={openLightboxForSeries}
            />
          </Drawer>

          <Box
            component="main"
            className="main-content"
            style={{ marginLeft: 0, marginTop: "60px", padding: 0 }}
          >
            {children}
          </Box>
        </>
      ) : (
        <>
          <Sidebar
            isCollapsed={isSidebarCollapsed}
            onToggle={() => setIsSidebarCollapsed((v) => !v)}
            onOpenLightboxWithSeries={openLightboxForSeries}
          />
          <Box component="main" className="main-content">{children}</Box>
        </>
      )}

      {/* Image Lightbox */}
      {isMobile ? (
        <MobileImageLightbox
          images={projectImages}
          currentIndex={activeImageIndex}
          imageCaptions={imageCaptions}
          projectInfo={projectInfo}
          isOpen={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
          onImageChange={setActiveImageIndex}
        />
      ) : (
        <ImageLightbox
          images={projectImages}
          currentIndex={activeImageIndex}
          imageCaptions={imageCaptions}
          projectInfo={projectInfo}
          isOpen={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
          onImageChange={setActiveImageIndex}
        />
      )}
    </Box>
  );
}
