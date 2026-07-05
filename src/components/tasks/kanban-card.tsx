"use client";

import { useDraggable } from "@dnd-kit/core";
import type { TaskRow } from "@/actions/tasks";
import { StatusBadge } from "@/components/ui/status-badge";
import { PriorityBadge } from "@/components/ui/priority-badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User } from "lucide-react";

const priorityBorder: Record<string, string> = {
  urgent: "border-l-priority-text-urgent",
  high: "border-l-priority-text-high",
  medium: "border-l-priority-text-medium",
  low: "border-l-priority-text-low",
  none: "border-l-transparent",
};

type Member = { id: string; name: string };

export function KanbanCard({
  task,
  members = [],
  isOverlay = false,
}: {
  task: TaskRow;
  members?: Member[];
  isOverlay?: boolean;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: task.id,
    data: { task },
    disabled: isOverlay,
  });

  const assignee = members.find((m) => m.id === task.assignee_id);

  let cardStyles = "shadow-card hover:shadow-elevated";
  if (isOverlay) {
    cardStyles = "shadow-overlay ring-2 ring-primary/20 rotate-1 scale-[1.02] z-50 cursor-grabbing bg-card";
  } else if (isDragging) {
    cardStyles = "opacity-30 border-dashed bg-secondary/20 shadow-none";
  }

  return (
    <div
      ref={setNodeRef}
      {...(!isOverlay ? listeners : {})}
      {...(!isOverlay ? attributes : {})}
      className={`group rounded border border-border/80 bg-card p-3 cursor-grab active:cursor-grabbing transition-all duration-100 border-l-[3px] ${
        priorityBorder[task.priority] ?? "border-l-transparent"
      } ${cardStyles}`}
    >
      <div className="flex flex-col gap-3">
        <p className="text-[14px] font-semibold text-foreground leading-tight">
          {task.title}
        </p>
        
        <div className="flex items-center justify-between mt-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <PriorityBadge priority={task.priority} />
            <StatusBadge status={task.status} />
          </div>
          
          {assignee ? (
            <Avatar className="h-6 w-6 shrink-0 ring-2 ring-background">
              <AvatarFallback className="text-[9px] bg-primary/10 text-primary font-bold">
                {assignee.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          ) : (
            <div className="h-6 w-6 shrink-0 rounded-full border border-dashed border-border flex items-center justify-center text-muted-foreground bg-secondary/30">
              <User className="h-3 w-3 opacity-50" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
