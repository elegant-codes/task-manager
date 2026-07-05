"use client";

import { useDroppable } from "@dnd-kit/core";
import type { TaskRow } from "@/actions/tasks";
import { KanbanCard } from "@/components/tasks/kanban-card";

const columnConfig: Record<
  string,
  { label: string; dot: string; tint: string }
> = {
  todo: {
    label: "To Do",
    dot: "bg-status-todo",
    tint: "bg-status-todo/5",
  },
  in_progress: {
    label: "In Progress",
    dot: "bg-status-in-progress",
    tint: "bg-status-in-progress/5",
  },
  done: {
    label: "Done",
    dot: "bg-status-done",
    tint: "bg-status-done/5",
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
    dot: "bg-muted-foreground",
    tint: "",
  };

  return (
    <div
      ref={setNodeRef}
      className={`flex-1 min-w-[280px] rounded-lg border border-border bg-card/40 transition-colors duration-150 ${
        isOver ? "bg-secondary/60" : ""
      } ${config.tint}`}
    >
      <div className="flex items-center gap-2 p-3 border-b border-border">
        <span className={`h-2 w-2 rounded-full ${config.dot}`} />
        <h3 className="font-semibold text-sm text-card-foreground">
          {config.label}
        </h3>
        <span className="text-xs text-muted-foreground bg-secondary px-1.5 py-0.5 rounded-full ml-auto">
          {tasks.length}
        </span>
      </div>
      <div className="p-2 space-y-2 min-h-[200px]">
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
