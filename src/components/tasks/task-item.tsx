"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

const statusColors: Record<string, string> = {
  backlog: "bg-muted text-muted-foreground",
  todo: "bg-blue-500/10 text-blue-500",
  in_progress: "bg-amber-500/10 text-amber-500",
  done: "bg-green-500/10 text-green-500",
  archived: "bg-muted text-muted-foreground",
};

const priorityColors: Record<string, string> = {
  none: "",
  low: "bg-gray-500/10 text-gray-400",
  medium: "bg-blue-500/10 text-blue-400",
  high: "bg-orange-500/10 text-orange-400",
  urgent: "bg-red-500/10 text-red-400",
};

export function TaskItem({
  task,
  projectSlug,
}: {
  task: TaskRow;
  projectSlug: string;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(task.status);

  async function handleStatusChange(newStatus: string | null) {
    if (!newStatus) return;
    setStatus(newStatus as TaskRow["status"]);
    try {
      const formData = new FormData();
      formData.set("status", newStatus);
      formData.set("project_slug", projectSlug);
      await updateTask(task.id, formData);
    } catch {
      setStatus(task.status);
      toast.error("Failed to update status");
    }
  }

  async function handleDelete() {
    try {
      const formData = new FormData();
      formData.set("project_slug", projectSlug);
      await deleteTask(task.id, formData);
      toast.success("Task deleted");
    } catch (error) {
      toast.error("Failed to delete task");
    }
  }

  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{task.title}</p>
      </div>

      <Badge className={priorityColors[task.priority]} variant="secondary">
        {task.priority}
      </Badge>

      <Select value={status} onValueChange={handleStatusChange}>
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
          <DropdownMenuItem onClick={handleDelete} className="text-destructive">
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
