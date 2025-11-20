"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import AdminProjectCreator from "@/components/AdminProjectCreator";
import AdminStoryCreator from "@/components/AdminStoryCreator";

function AdminNewProjectContent() {
  const searchParams = useSearchParams();
  const kindParam = searchParams.get("kind");
  const kind = kindParam === "story" ? "story" : "project";

  if (kind === "story") {
    return <AdminStoryCreator />;
  }

  return <AdminProjectCreator kind={kind} />;
}

export default function AdminNewProjectPage() {
  return (
    <Suspense fallback={null}>
      <AdminNewProjectContent />
    </Suspense>
  );
}
