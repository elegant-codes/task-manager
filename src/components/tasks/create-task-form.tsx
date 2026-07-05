"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createTask } from "@/actions/tasks";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

type Member = { id: string; name: string };

export function CreateTaskForm({
  projectId,
  projectSlug,
  members = [],
}: {
  projectId: string;
  projectSlug: string;
  members?: Member[];
}) {
  const [title, setTitle] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [priority, setPriority] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.set("title", title);
      formData.set("project_id", projectId);
      formData.set("project_slug", projectSlug);
      if (assigneeId) formData.set("assignee_id", assigneeId);
      if (priority) formData.set("priority", priority);
      await createTask(formData);
      setTitle("");
      setAssigneeId("");
      setPriority("");
      toast.success("Task created");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create task");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 flex-wrap">
      <Input
        placeholder="Add a task... (press Enter)"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        disabled={loading}
        className="flex-1 min-w-[200px] focus-visible:ring-2 focus-visible:ring-ring"
      />
      <Select value={priority} onValueChange={(v) => setPriority(v ?? "")}>
        <SelectTrigger className="w-24 h-9 text-xs">
          <SelectValue placeholder="Priority" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">No priority</SelectItem>
          <SelectItem value="urgent">Urgent</SelectItem>
          <SelectItem value="high">High</SelectItem>
          <SelectItem value="medium">Medium</SelectItem>
          <SelectItem value="low">Low</SelectItem>
        </SelectContent>
      </Select>
      {members.length > 0 && (
        <Select value={assigneeId} onValueChange={(v) => setAssigneeId(v ?? "")}>
          <SelectTrigger className="w-32 h-9 text-xs">
            <SelectValue placeholder="Assign to" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Unassigned</SelectItem>
            {members.map((m) => (
              <SelectItem key={m.id} value={m.id}>
                {m.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
      <Button type="submit" disabled={loading || !title.trim()}>
        {loading ? "Adding..." : "Add"}
      </Button>
    </form>
  );
}
