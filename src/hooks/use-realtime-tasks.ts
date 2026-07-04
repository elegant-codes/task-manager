"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { TaskRow } from "@/actions/tasks";

type Setter = React.Dispatch<React.SetStateAction<TaskRow[]>>;

export function useRealtimeTaskMembers(
  projectId: string,
  onMemberChange: () => void
) {
  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel(`task-members:${projectId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "project_members",
          filter: `project_id=eq.${projectId}`,
        },
        () => {
          onMemberChange();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId, onMemberChange]);
}

export function useRealtimeTasks(projectId: string, setTasks: Setter) {
  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel(`tasks:${projectId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tasks",
          filter: `project_id=eq.${projectId}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const newTask = payload.new as TaskRow;
            setTasks((prev) => [newTask, ...prev]);
          } else if (payload.eventType === "UPDATE") {
            const updatedTask = payload.new as TaskRow;
            setTasks((prev) =>
              prev.map((t) => (t.id === updatedTask.id ? updatedTask : t))
            );
          } else if (payload.eventType === "DELETE") {
            const deletedId = payload.old.id as string;
            setTasks((prev) => prev.filter((t) => t.id !== deletedId));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId, setTasks]);
}
