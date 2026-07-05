import { getProjectBySlug } from "@/actions/projects";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { TaskList } from "@/components/tasks/task-list";
import { TaskFilters } from "@/components/tasks/task-filters";
import { InviteMemberDialog } from "@/components/projects/invite-member-dialog";

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
      <div className="flex items-center justify-between mb-8">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            {project.name}
          </h1>
          <p className="text-sm text-muted-foreground font-medium flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Active Project
          </p>
        </div>
        <InviteMemberDialog projectId={project.id} />
      </div>
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
