import { notFound } from "next/navigation";
import { getProjectWithBlocks, initializeDatabase, getAllProjects } from "@/lib/supabase";
import StoryDisplay from "@/components/StoryDisplay";

interface StoryPageProps {
  params: Promise<{ slug: string }>;
}

export default async function StoryPage({ params }: StoryPageProps) {
  const { slug } = await params;

  await initializeDatabase();

  // Get all projects to find by slug
  const allProjects = await getAllProjects(false); // Get all, including unpublished

  const story = allProjects.find(
    (p) => p.slug === slug && (p.kind === "story" || p.kind === null)
  );

  if (!story) {
    notFound();
  }

  // Get full story with content blocks
  const fullStory = await getProjectWithBlocks(story.id);

  if (!fullStory || !fullStory.published) {
    notFound();
  }

  return <StoryDisplay blocks={fullStory.contentBlocks} />;
}

