"use client";

import type { TaskRow } from "@/actions/tasks";
import { deleteTask, updateTask } from "@/actions/tasks";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

const priorityColors: Record<string, string> = {
  none: "",
  low: "bg-gray-500/10 text-gray-400",
  medium: "bg-blue-500/10 text-blue-400",
  high: "bg-orange-500/10 text-orange-400",
  urgent: "bg-red-500/10 text-red-400",
};

type Member = { id: string; name: string };

export function TaskItem({
  task,
  projectSlug,
  members = [],
}: {
  task: TaskRow;
  projectSlug: string;
  members?: Member[];
}) {
  const assigneeName = members.find((m) => m.id === task.assignee_id)?.name;

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
    <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{task.title}</p>
        <div className="flex items-center gap-2 mt-1">
          {task.priority !== "none" && (
            <Badge className={priorityColors[task.priority]} variant="secondary">
              {task.priority}
            </Badge>
          )}
          {assigneeName && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <User className="h-3 w-3" />
              {assigneeName}
            </span>
          )}
        </div>
      </div>

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
          render={<Button variant="ghost" size="icon" className="h-8 w-8" />}
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
          <DropdownMenuItem onClick={handleDelete} className="text-destructive">
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
