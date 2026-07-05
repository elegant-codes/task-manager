"use client";

import { useDroppable } from "@dnd-kit/core";
import type { TaskRow } from "@/actions/tasks";
import { KanbanCard } from "@/components/tasks/kanban-card";

const columnConfig: Record<
  string,
  { label: string; tint: string }
> = {
  backlog: {
    label: "Backlog",
    tint: "border-t-muted-foreground/40",
  },
  todo: {
    label: "To Do",
    tint: "border-t-status-text-todo",
  },
  in_progress: {
    label: "In Progress",
    tint: "border-t-status-text-in-progress",
  },
  done: {
    label: "Done",
    tint: "border-t-status-text-done",
  },
  archived: {
    label: "Archived",
    tint: "border-t-status-text-archived",
  },
};

type Member = { id: string; name: string };

export function KanbanColumn({
  status,
  tasks,
  members = [],
}: {
  status: string;
  tasks: TaskRow[];
  members?: Member[];
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  const config = columnConfig[status] ?? {
    label: status,
    tint: "border-t-muted-foreground",
  };

  return (
    <div
      ref={setNodeRef}
      className={`flex-1 min-w-[300px] rounded-md border border-border bg-secondary/30 transition-all duration-200 border-t-2 ${config.tint} ${
        isOver ? "ring-2 ring-primary/50 shadow-md bg-secondary/50" : ""
      }`}
    >
      <div className="flex items-center justify-between p-3.5 border-b border-border/50">
        <h3 className="font-semibold text-sm text-card-foreground">
          {config.label}
        </h3>
        <span className="text-xs font-medium text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
          {tasks.length}
        </span>
      </div>
      <div className="p-2.5 space-y-2.5 min-h-[200px]">
        {tasks.map((task) => (
          <KanbanCard key={task.id} task={task} members={members} />
        ))}
        {tasks.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-8">
            Drop tasks here
          </p>
        )}
      </div>
    </div>
  );
}
