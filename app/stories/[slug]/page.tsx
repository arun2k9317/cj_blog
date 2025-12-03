import { redirect } from "next/navigation";

interface StoryPageProps {
  params: Promise<{ slug: string }>;
}

export default async function StoryPage({ params }: StoryPageProps) {
  const { slug } = await params;
  // Redirect old route to new viewer route
  redirect(`/view/story/${slug}`);
}

