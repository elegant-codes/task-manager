"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import type { TaskRow } from "@/actions/tasks";
import { Badge } from "@/components/ui/badge";

const priorityColors: Record<string, string> = {
  none: "",
  low: "bg-gray-500/10 text-gray-400",
  medium: "bg-blue-500/10 text-blue-400",
  high: "bg-orange-500/10 text-orange-400",
  urgent: "bg-red-500/10 text-red-400",
};

export function KanbanCard({ task }: { task: TaskRow }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
    data: { task },
  });

  const style = transform
    ? { transform: CSS.Translate.toString(transform) }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={style}
      className={`rounded-lg border border-border bg-card p-3 cursor-grab active:cursor-grabbing transition-shadow ${
        isDragging ? "shadow-lg opacity-50 z-50" : "hover:shadow-md"
      }`}
    >
      <p className="text-sm font-medium mb-2">{task.title}</p>
      {task.priority !== "none" && (
        <Badge className={priorityColors[task.priority]} variant="secondary">
          {task.priority}
        </Badge>
      )}
    </div>
  );
}
