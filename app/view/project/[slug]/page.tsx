import { notFound } from "next/navigation";
import { getProjects, getProjectWithBlocks } from "@/lib/supabase";
import ProjectViewer from "@/components/ProjectViewer";

export const dynamic = 'force-dynamic';

export default async function ProjectViewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  try {
    const allProjects = await getProjects({ publishedOnly: true, kind: 'project' });
    const project = allProjects.find(p => p.slug === slug || p.id === slug);

    if (!project) {
      notFound();
    }

    const fullProject = await getProjectWithBlocks(project.id);

    if (!fullProject || !fullProject.published) {
      notFound();
    }

    return <ProjectViewer project={fullProject} />;
  } catch (error) {
    console.error('Error fetching project:', error);
    notFound();
  }
}

