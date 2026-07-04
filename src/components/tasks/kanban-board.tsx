"use client";

import { useState } from "react";
import { DndContext, DragEndEvent, DragStartEvent, DragOverlay } from "@dnd-kit/core";
import type { TaskRow } from "@/actions/tasks";
import { getProjectTasks, updateTask } from "@/actions/tasks";
import { KanbanColumn } from "@/components/tasks/kanban-column";
import { KanbanCard } from "@/components/tasks/kanban-card";
import { toast } from "sonner";

const COLUMNS = ["todo", "in_progress", "done"];

export function KanbanBoard({
  initialTasks,
  projectId,
  projectSlug,
}: {
  initialTasks: TaskRow[];
  projectId: string;
  projectSlug: string;
}) {
  const [tasks, setTasks] = useState<TaskRow[]>(initialTasks);
  const [activeTask, setActiveTask] = useState<TaskRow | null>(null);

  async function refreshTasks() {
    try {
      const updated = await getProjectTasks(projectId);
      setTasks(updated);
    } catch {
      // silent fallback
    }
  }

  function handleDragStart(event: DragStartEvent) {
    const taskId = event.active.id as string;
    const task = tasks.find((t) => t.id === taskId);
    if (task) setActiveTask(task);
  }

  async function handleDragEnd(event: DragEndEvent) {
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;

    const taskId = active.id as string;
    const newStatus = over.id as string;

    if (!COLUMNS.includes(newStatus)) return;

    const task = tasks.find((t) => t.id === taskId);
    if (!task || task.status === newStatus) return;

    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus as TaskRow["status"] } : t))
    );

    try {
      const formData = new FormData();
      formData.set("status", newStatus);
      formData.set("project_slug", projectSlug);
      await updateTask(taskId, formData);
    } catch {
      toast.error("Failed to update task status");
      refreshTasks();
    }
  }

  const tasksByStatus: Record<string, TaskRow[]> = {};
  for (const col of COLUMNS) {
    tasksByStatus[col] = tasks.filter((t) => t.status === col);
  }

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {COLUMNS.map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            tasks={tasksByStatus[status] || []}
          />
        ))}
      </div>
      <DragOverlay>
        {activeTask ? <KanbanCard task={activeTask} /> : null}
      </DragOverlay>
    </DndContext>
  );
}
