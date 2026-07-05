"use client";

import { useEffect, useState, useCallback } from "react";
import type { TaskRow } from "@/actions/tasks";
import { getProjectTasks, getProjectMembers } from "@/actions/tasks";
import { TaskItem } from "@/components/tasks/task-item";
import { KanbanBoard } from "@/components/tasks/kanban-board";
import { Skeleton } from "@/components/ui/skeleton";
import { CreateTaskForm } from "@/components/tasks/create-task-form";
import { useRealtimeTasks, useRealtimeTaskMembers } from "@/hooks/use-realtime-tasks";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";

type Filters = {
  status?: string;
  priority?: string;
  view?: string;
};

type Member = { id: string; name: string; avatar_url: string | null };

export function TaskList({
  projectId,
  projectSlug,
  filters = {},
}: {
  projectId: string;
  projectSlug: string;
  filters?: Filters;
}) {
  const [tasks, setTasks] = useState<TaskRow[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMembers = useCallback(async () => {
    try {
      const members = await getProjectMembers(projectId);
      setMembers(members);
    } catch (error) {
      console.error(error);
    }
  }, [projectId]);

  useEffect(() => {
    Promise.all([
      getProjectTasks(projectId),
      getProjectMembers(projectId),
    ])
      .then(([tasks, members]) => {
        setTasks(tasks);
        setMembers(members);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [projectId]);

  useRealtimeTasks(projectId, setTasks);
  useRealtimeTaskMembers(projectId, fetchMembers);

  const effectiveView = filters.view || "board";

  const filteredTasks = tasks.filter((task) => {
    if (filters.status && task.status !== filters.status) return false;
    if (filters.priority && task.priority !== filters.priority) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-10 w-full rounded-lg" />
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-14 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <CreateTaskForm
          projectId={projectId}
          projectSlug={projectSlug}
          members={members}
        />
        <Dialog>
          <DialogTrigger
            render={<Button variant="outline" size="sm" className="gap-2 self-end sm:self-auto" />}
          >
            <Users className="h-4 w-4" />
            {members.length}
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Project members</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              {members.map((m) => (
                <div key={m.id} className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">
                      {m.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm">{m.name}</span>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-2 text-xs text-muted-foreground px-1">
        <span className="font-medium">{tasks.length} task{tasks.length !== 1 ? "s" : ""}</span>
        {filters.status && <span>· filtered by {filters.status.replace("_", " ")}</span>}
        {filters.priority && <span>· {filters.priority} priority</span>}
      </div>

      {effectiveView === "board" ? (
        tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <svg
              width="48"
              height="48"
              viewBox="0 0 48 48"
              fill="none"
              className="mb-4 text-muted-foreground"
            >
              <rect
                x="6"
                y="8"
                width="36"
                height="32"
                rx="3"
                stroke="currentColor"
                strokeWidth="1.5"
                fill="none"
              />
              <path
                d="M6 16h36M16 8v32"
                stroke="currentColor"
                strokeWidth="1.5"
                opacity="0.3"
              />
              <circle cx="36" cy="36" r="8" fill="var(--color-primary)" opacity="0.12" />
              <path
                d="M33 36h6M36 33v6"
                stroke="var(--color-primary)"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            <p className="text-sm text-muted-foreground">
              No tasks yet. Create one above.
            </p>
          </div>
        ) : (
          <KanbanBoard
            tasks={tasks}
            setTasks={setTasks}
            projectSlug={projectSlug}
            members={members}
          />
        )
      ) : filteredTasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <svg
            width="48"
            height="48"
            viewBox="0 0 48 48"
            fill="none"
            className="mb-4 text-muted-foreground"
          >
            {tasks.length === 0 ? (
              <>
                <rect
                  x="8"
                  y="10"
                  width="32"
                  height="28"
                  rx="3"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  fill="none"
                />
                <path
                  d="M16 20h16M16 27h12M16 34h8"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  opacity="0.4"
                />
                <circle cx="36" cy="36" r="8" fill="var(--color-primary)" opacity="0.12" />
                <path
                  d="M33 36h6M36 33v6"
                  stroke="var(--color-primary)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </>
            ) : (
              <>
                <circle cx="24" cy="24" r="14" stroke="currentColor" strokeWidth="1.5" fill="none" />
                <path
                  d="M24 18v6l4 4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  opacity="0.5"
                />
                <path d="M14 14l20 20" stroke="currentColor" strokeWidth="1.5" opacity="0.2" />
              </>
            )}
          </svg>
          <p className="text-sm text-muted-foreground">
            {tasks.length === 0
              ? "No tasks yet. Create one above."
              : "No tasks match the current filters."}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredTasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              projectSlug={projectSlug}
              members={members}
            />
          ))}
        </div>
      )}
    </div>
  );
}
