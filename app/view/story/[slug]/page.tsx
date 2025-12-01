import { notFound } from "next/navigation";
import { getProjects, getProjectWithBlocks } from "@/lib/supabase";
import StoryViewer from "@/components/StoryViewer";

export const dynamic = 'force-dynamic';

export default async function StoryViewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  try {
    const allStories = await getProjects({ publishedOnly: true, kind: 'story' });
    const story = allStories.find(s => s.slug === slug || s.id === slug);

    if (!story) {
      notFound();
    }

    const fullStory = await getProjectWithBlocks(story.id);

    if (!fullStory || !fullStory.published) {
      notFound();
    }

    return <StoryViewer story={fullStory} />;
  } catch (error) {
    console.error('Error fetching story:', error);
    notFound();
  }
}

