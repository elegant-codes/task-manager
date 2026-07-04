"use client";

import { useDroppable } from "@dnd-kit/core";
import type { TaskRow } from "@/actions/tasks";
import { KanbanCard } from "@/components/tasks/kanban-card";

const columnTitles: Record<string, string> = {
  todo: "To Do",
  in_progress: "In Progress",
  done: "Done",
};

const columnColors: Record<string, string> = {
  todo: "border-t-blue-500",
  in_progress: "border-t-amber-500",
  done: "border-t-green-500",
};

export function KanbanColumn({
  status,
  tasks,
}: {
  status: string;
  tasks: TaskRow[];
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div
      ref={setNodeRef}
      className={`flex-1 min-w-[280px] rounded-lg border border-border bg-card/50 border-t-2 ${columnColors[status]} ${
        isOver ? "bg-secondary/50" : ""
      }`}
    >
      <div className="p-3 border-b border-border">
        <h3 className="font-semibold text-sm flex items-center gap-2">
          {columnTitles[status] || status}
          <span className="text-xs text-muted-foreground bg-secondary px-1.5 py-0.5 rounded-full">
            {tasks.length}
          </span>
        </h3>
      </div>
      <div className="p-2 space-y-2 min-h-[200px]">
        {tasks.map((task) => (
          <KanbanCard key={task.id} task={task} />
        ))}
        {tasks.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-4">
            Drop tasks here
          </p>
        )}
      </div>
    </div>
  );
}
