"use client";

import { createContext, useContext, useMemo, useState, PropsWithChildren } from "react";

export type Series = {
  id: string;
  title: string;
  folder: string;
  description: string;
  count: number;
  ext: string;
};

export const BLOB_BASE =
  "https://v96anmwogiriaihi.public.blob.vercel-storage.com/admin-uploads";

export const PROJECTS_SERIES: Series[] = [
  {
    id: "behindTheTeaCup",
    title: "Behind The Tea Cup",
    folder: "behindTheTeaCup",
    description: "Behind The Tea Cup photo series.",
    count: 10,
    ext: "jpg",
  },
  {
    id: "coffee-and-the-hills",
    title: "Coffee And The Hills",
    folder: "coffeeAndTheHills",
    description: "Coffee And The Hills photo series.",
    count: 16,
    ext: "jpg",
  },
];

export const STORIES_SERIES: Series[] = [
  {
    id: "dusk-falls-on-mountains",
    title: "Dusk Falls On Mountains",
    folder: "duskFallsOnMountains",
    description: "Dusk Falls On Mountains photo series.",
    count: 7,
    ext: "jpg",
  },
  {
    id: "kalaripayattu",
    title: "Kalaripayattu",
    folder: "kalaripayattu",
    description: "kalaripayattu photo series.",
    count: 15,
    ext: "JPG",
  },
];

type GalleryContextValue = {
  isOpen: boolean;
  selectedSeriesId: string | null;
  openSeries: (id: string) => void;
  close: () => void;
  allSeries: Series[];
};

const GalleryContext = createContext<GalleryContextValue | undefined>(undefined);

export function useGallery() {
  const ctx = useContext(GalleryContext);
  if (!ctx) throw new Error("useGallery must be used within GalleryProvider");
  return ctx;
}

export function GalleryProvider({ children }: PropsWithChildren) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedSeriesId, setSelectedSeriesId] = useState<string | null>(null);

  const allSeries = useMemo(() => [...PROJECTS_SERIES, ...STORIES_SERIES], []);

  const value: GalleryContextValue = {
    isOpen,
    selectedSeriesId,
    openSeries: (id: string) => {
      setSelectedSeriesId(id);
      setIsOpen(true);
    },
    close: () => setIsOpen(false),
    allSeries,
  };

  return <GalleryContext.Provider value={value}>{children}</GalleryContext.Provider>;
}


