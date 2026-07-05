"use client";

import type { TaskRow } from "@/actions/tasks";
import { deleteTask, updateTask } from "@/actions/tasks";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Trash2, User } from "lucide-react";
import { toast } from "sonner";

type Member = { id: string; name: string };

function PriorityDot({ priority }: { priority: string }) {
  const colors: Record<string, string> = {
    urgent: "bg-priority-urgent",
    high: "bg-priority-high",
    medium: "bg-priority-medium",
    low: "bg-priority-low",
  };
  if (priority === "none") return null;
  return (
    <span
      className={`h-2 w-2 rounded-full ${colors[priority] ?? "bg-muted-foreground"}`}
    />
  );
}

export function TaskItem({
  task,
  projectSlug,
  members = [],
}: {
  task: TaskRow;
  projectSlug: string;
  members?: Member[];
}) {
  const assignee = members.find((m) => m.id === task.assignee_id);

  async function handleStatusChange(newStatus: string | null) {
    if (!newStatus) return;
    try {
      const formData = new FormData();
      formData.set("status", newStatus);
      formData.set("project_slug", projectSlug);
      await updateTask(task.id, formData);
    } catch {
      toast.error("Failed to update status");
    }
  }

  async function handleAssign(userId: string) {
    try {
      const formData = new FormData();
      formData.set("assignee_id", userId || "");
      formData.set("project_slug", projectSlug);
      await updateTask(task.id, formData);
      toast.success(userId ? "Task assigned" : "Task unassigned");
    } catch {
      toast.error("Failed to assign task");
    }
  }

  async function handleDelete() {
    try {
      const formData = new FormData();
      formData.set("project_slug", projectSlug);
      await deleteTask(task.id, formData);
      toast.success("Task deleted");
    } catch {
      toast.error("Failed to delete task");
    }
  }

  return (
    <div className="group flex items-center gap-3 rounded-lg border border-border bg-card p-3 transition-all duration-150 hover:shadow-elevated hover:-translate-y-0.5">
      <PriorityDot priority={task.priority} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-card-foreground truncate">
          {task.title}
        </p>
        <div className="flex items-center gap-2 mt-1.5">
          <StatusBadge status={task.status} />
          {assignee && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <User className="h-3 w-3" />
              {assignee.name}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
        {assignee ? (
          <Avatar className="h-7 w-7 ring-2 ring-border">
            <AvatarFallback className="text-[10px] bg-secondary text-muted-foreground">
              {assignee.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        ) : (
          <Avatar className="h-7 w-7 ring-2 ring-border opacity-50">
            <AvatarFallback className="text-[10px] bg-secondary text-muted-foreground">
              <User className="h-3 w-3" />
            </AvatarFallback>
          </Avatar>
        )}

        <Select value={task.status} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-28 h-7 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="backlog">Backlog</SelectItem>
            <SelectItem value="todo">To Do</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="done">Done</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={<Button variant="ghost" size="icon" className="h-7 w-7" />}
          >
            <MoreHorizontal className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {members.length > 0 && (
              <>
                <DropdownMenuItem
                  onClick={() => handleAssign("")}
                  disabled={!task.assignee_id}
                >
                  <User className="h-4 w-4 mr-2" />
                  Unassign
                </DropdownMenuItem>
                {members.map((m) => (
                  <DropdownMenuItem
                    key={m.id}
                    onClick={() => handleAssign(m.id)}
                    disabled={m.id === task.assignee_id}
                  >
                    Assign to {m.name}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
              </>
            )}
            <DropdownMenuItem
              onClick={handleDelete}
              className="text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
