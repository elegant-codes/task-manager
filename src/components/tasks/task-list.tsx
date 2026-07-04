"use client";

import { useEffect, useState } from "react";
import type { TaskRow } from "@/actions/tasks";
import { getProjectTasks } from "@/actions/tasks";
import { TaskItem } from "@/components/tasks/task-item";
import { KanbanBoard } from "@/components/tasks/kanban-board";
import { Skeleton } from "@/components/ui/skeleton";
import { CreateTaskForm } from "@/components/tasks/create-task-form";
import { useRealtimeTasks } from "@/hooks/use-realtime-tasks";

type Filters = {
  status?: string;
  priority?: string;
  view?: string;
};

export function TaskList({
  projectId,
  projectSlug,
  filters = {},
}: {
  projectId: string;
  projectSlug: string;
  filters?: Filters;
}) {
  const [tasks, setTasks] = useState<TaskRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProjectTasks(projectId)
      .then(setTasks)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [projectId]);

  useRealtimeTasks(projectId, setTasks);

  const filteredTasks = tasks.filter((task) => {
    if (filters.status && task.status !== filters.status) return false;
    if (filters.priority && task.priority !== filters.priority) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-10 w-full rounded-lg" />
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-14 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (filters.view === "board") {
    return (
      <div className="space-y-4">
        <CreateTaskForm projectId={projectId} projectSlug={projectSlug} />
        {tasks.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No tasks yet. Create one above.
          </p>
        ) : (
          <KanbanBoard
            initialTasks={tasks}
            projectId={projectId}
            projectSlug={projectSlug}
          />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <CreateTaskForm projectId={projectId} projectSlug={projectSlug} />

      {filteredTasks.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">
          {tasks.length === 0
            ? "No tasks yet. Create one above."
            : "No tasks match the current filters."}
        </p>
      ) : (
        <div className="space-y-2">
          {filteredTasks.map((task) => (
            <TaskItem key={task.id} task={task} projectSlug={projectSlug} />
          ))}
        </div>
      )}
    </div>
  );
}
