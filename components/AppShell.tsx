"use client";

import { useEffect, useMemo, useState, PropsWithChildren } from "react";
import Sidebar from "@/components/Sidebar";
import ImageLightbox from "@/components/ImageLightbox";
import { BLOB_BASE, Series, projectsSeries, storiesSeries } from "@/lib/series";

export default function AppShell({ children }: PropsWithChildren) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selectedSeriesId, setSelectedSeriesId] = useState<string | null>(null);

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

  const projectInfo = {
    title: activeSeries.title,
    description: activeSeries.description,
    location: "",
  };

  const openLightboxForSeries = (seriesId: string | null) => {
    if (seriesId) setSelectedSeriesId(seriesId);
    setLightboxOpen(true);
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

  return (
    <div className={`main-layout ${isSidebarCollapsed ? "sidebar-collapsed" : ""}`}>
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed((v) => !v)}
        onOpenLightboxWithSeries={openLightboxForSeries}
      />
      <main className="main-content">{children}</main>
      <ImageLightbox
        images={projectImages}
        currentIndex={0}
        projectInfo={projectInfo}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />
    </div>
  );
}


