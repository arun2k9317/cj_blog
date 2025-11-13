import AdminProjectCreator from "@/components/AdminProjectCreator";
import { getProjectWithBlocks, initializeDatabase } from "@/lib/supabase";
import { notFound } from "next/navigation";

interface AdminEditProjectPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminEditProjectPage({
  params,
}: AdminEditProjectPageProps) {
  const { id } = await params;

  await initializeDatabase();
  const project = await getProjectWithBlocks(id);

  if (!project) {
    notFound();
  }

  const kind = project.kind === "story" ? "story" : "project";

  return <AdminProjectCreator kind={kind} initialProject={project} />;
}
