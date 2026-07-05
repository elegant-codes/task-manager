"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import type { TaskRow } from "@/actions/tasks";
import { StatusBadge } from "@/components/ui/status-badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User } from "lucide-react";

const priorityBorder: Record<string, string> = {
  urgent: "border-l-priority-urgent",
  high: "border-l-priority-high",
  medium: "border-l-priority-medium",
  low: "border-l-priority-low",
  none: "border-l-transparent",
};

type Member = { id: string; name: string };

export function KanbanCard({
  task,
  members = [],
}: {
  task: TaskRow;
  members?: Member[];
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: task.id,
      data: { task },
    });

  const style = transform
    ? { transform: CSS.Translate.toString(transform) }
    : undefined;

  const assignee = members.find((m) => m.id === task.assignee_id);

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={style}
      className={`rounded-lg border border-border bg-card p-3 cursor-grab active:cursor-grabbing transition-all duration-150 border-l-[3px] ${
        priorityBorder[task.priority] ?? "border-l-transparent"
      } ${isDragging ? "shadow-overlay opacity-90 z-50 rotate-2 scale-105" : "hover:shadow-elevated hover:-translate-y-0.5"}`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className="text-sm font-medium text-card-foreground leading-snug">
          {task.title}
        </p>
        {assignee && (
          <Avatar className="h-6 w-6 shrink-0 ring-2 ring-border">
            <AvatarFallback className="text-[9px] bg-secondary text-muted-foreground">
              {assignee.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        )}
      </div>
      <div className="flex items-center gap-2">
        <StatusBadge status={task.status} />
        {!assignee && (
          <span className="text-muted-foreground">
            <User className="h-3 w-3" />
          </span>
        )}
      </div>
    </div>
  );
}
