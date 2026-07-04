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
      <div className="flex items-center justify-between">
        <CreateTaskForm
          projectId={projectId}
          projectSlug={projectSlug}
          members={members}
        />
        <Dialog>
          <DialogTrigger
            render={<Button variant="outline" size="sm" className="gap-2" />}
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

      {filters.view === "board" ? (
        tasks.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No tasks yet. Create one above.
          </p>
        ) : (
          <KanbanBoard
            tasks={tasks}
            setTasks={setTasks}
            projectSlug={projectSlug}
          />
        )
      ) : filteredTasks.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">
          {tasks.length === 0
            ? "No tasks yet. Create one above."
            : "No tasks match the current filters."}
        </p>
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
