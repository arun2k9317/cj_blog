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
    description:
      "In the quiet slopes of the highlands, life unfolds between rows of green. Behind the Tea Cup looks beyond the familiar comfort of what we drink each morning — to the landscapes, the hands, and the heritage that make it possible. Through moments of stillness and labor, the series traces the unseen stories of those who live and work where tea begins.",
    count: 10,
    ext: "jpg",
  },
  {
    id: "coffee-and-the-hills",
    title: "Coffee And The Hills",
    folder: "coffeeAndTheHills",
    description:
      "In the folds of the Western Ghats, coffee ripens under shifting light and mist. Coffee and the Hills traces the everyday rhythm of plantation life — from the drying yards to the silent slopes — where labor, land, and legacy are bound together. These photographs look beyond the aroma of the brew, capturing the human effort that shapes each bean long before it reaches the cup.",
    count: 16,
    ext: "jpg",
  },
];

export const storiesSeries: Series[] = [
  {
    id: "dusk-falls-on-mountains",
    title: "Dusk Falls On Mountains",
    folder: "duskFallsOnMountains",
    description:
      "As day folds into dusk, the mountains breathe in silence. Dusk Falls on Mountains follows the shifting light and shadow across highland paths, forests, and valleys — spaces where time slows and the ordinary turns ethereal. These images trace the quiet transition between labor and rest, between the seen and the fading, where nature holds its own rhythm.",
    count: 7,
    ext: "jpg",
  },
  {
    id: "kalaripayattu",
    title: "Kalaripayattu",
    folder: "kalaripayattu",
    description:
      "On the sands by the sea, the ancient martial art of Kalaripayattu unfolds — a dialogue between body, weapon, and spirit. Kalaripayattu captures moments of focus, rhythm, and tradition, tracing the continuum of an art form that has survived centuries through practice, patience, and respect. These images reflect a discipline that moves between stillness and strike, between the personal and the ancestral.",
    count: 15,
    ext: "JPG",
  },
];


