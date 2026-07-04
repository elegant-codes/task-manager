import { getProjectBySlug } from "@/actions/projects";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { TaskList } from "@/components/tasks/task-list";
import { TaskFilters } from "@/components/tasks/task-filters";

export default async function ProjectPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ status?: string; priority?: string; view?: string }>;
}) {
  const { slug } = await params;
  const filters = await searchParams;

  let project;
  try {
    project = await getProjectBySlug(slug);
  } catch {
    notFound();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{project.name}</h1>
      <Suspense fallback={null}>
        <TaskFilters />
      </Suspense>
      <TaskList
        projectId={project.id}
        projectSlug={slug}
        filters={filters}
      />
    </div>
  );
}
