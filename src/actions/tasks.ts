"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const createTaskSchema = z.object({
  title: z.string().min(1).max(200),
  status: z.enum(["backlog", "todo", "in_progress", "done", "archived"]).default("backlog"),
  priority: z.enum(["none", "low", "medium", "high", "urgent"]).default("none"),
  assignee_id: z.string().uuid().nullable().optional(),
});

const updateTaskSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  status: z.enum(["backlog", "todo", "in_progress", "done", "archived"]).optional(),
  priority: z.enum(["none", "low", "medium", "high", "urgent"]).optional(),
  assignee_id: z.string().uuid().nullable().optional(),
  description: z.string().nullable().optional(),
});

export type TaskRow = {
  id: string;
  title: string;
  description: string | null;
  status: "backlog" | "todo" | "in_progress" | "done" | "archived";
  priority: "none" | "low" | "medium" | "high" | "urgent";
  position: number;
  project_id: string;
  assignee_id: string | null;
  created_by: string;
  due_date: string | null;
  created_at: string;
  updated_at: string;
};

export async function createTask(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const parsed = createTaskSchema.parse({
    title: formData.get("title"),
    status: formData.get("status") || "backlog",
    priority: formData.get("priority") || "none",
    assignee_id: formData.get("assignee_id") || null,
  });

  const projectId = formData.get("project_id") as string;

  const { data, error } = await supabase
    .from("tasks")
    .insert({
      title: parsed.title,
      status: parsed.status,
      priority: parsed.priority,
      assignee_id: parsed.assignee_id,
      project_id: projectId,
      created_by: user.id,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  revalidatePath(`/projects/${formData.get("project_slug")}`);
  return data as TaskRow;
}

export async function getProjectTasks(projectId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("project_id", projectId)
    .order("position", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data as TaskRow[];
}

export async function updateTask(taskId: string, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const updates: Record<string, unknown> = {};
  const title = formData.get("title");
  const status = formData.get("status");
  const priority = formData.get("priority");
  const assigneeId = formData.get("assignee_id");

  if (title) updates.title = title;
  if (status) updates.status = status;
  if (priority) updates.priority = priority;
  if (assigneeId !== null) {
    updates.assignee_id = assigneeId || null;
  }

  const parsed = updateTaskSchema.parse(updates);

  const { data, error } = await supabase
    .from("tasks")
    .update(parsed)
    .eq("id", taskId)
    .select()
    .single();

  if (error) throw new Error(error.message);

  const slug = formData.get("project_slug") as string;
  revalidatePath(`/projects/${slug}`);
  return data as TaskRow;
}

export async function deleteTask(taskId: string, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("tasks")
    .delete()
    .eq("id", taskId);

  if (error) throw new Error(error.message);

  const slug = formData.get("project_slug") as string;
  revalidatePath(`/projects/${slug}`);
}

export async function getProjectMembers(projectId: string) {
  const supabase = await createClient();
  const admin = createAdminClient();

  const { data, error } = await supabase
    .from("project_members")
    .select("user_id")
    .eq("project_id", projectId)
    .eq("status", "active");

  if (error) throw new Error(error.message);

  const userIds = data.map((m: { user_id: string }) => m.user_id);

  if (userIds.length === 0) return [];

  const { data: profiles, error: profileError } = await admin
    .from("profiles")
    .select("id, name, avatar_url")
    .in("id", userIds);

  if (profileError) throw new Error(profileError.message);
  return profiles as { id: string; name: string; avatar_url: string | null }[];
}
