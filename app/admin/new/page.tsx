"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import AdminProjectCreator from "@/components/AdminProjectCreator";

function AdminNewProjectContent() {
  const searchParams = useSearchParams();
  const kindParam = searchParams.get("kind");
  const kind = kindParam === "story" ? "story" : "project";

  return <AdminProjectCreator kind={kind} />;
}

export default function AdminNewProjectPage() {
  return (
    <Suspense fallback={null}>
      <AdminNewProjectContent />
    </Suspense>
  );
}
