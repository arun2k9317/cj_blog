export type Series = {
  id: string;
  title: string;
  folder: string;
  description: string;
  count: number;
  ext: string; // file extension like jpg / JPG
};

export const BLOB_BASE =
  "https://v96anmwogiriaihi.public.blob.vercel-storage.com/admin-uploads";

export const projectsSeries: Series[] = [
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

export const storiesSeries: Series[] = [
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


