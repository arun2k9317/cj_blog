import { redirect } from "next/navigation";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  // Redirect old route to new viewer route
  redirect(`/view/project/${id}`);
}
