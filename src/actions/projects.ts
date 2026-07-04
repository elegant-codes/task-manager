"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const createProjectSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(200),
});

export type Project = {
  id: string;
  name: string;
  slug: string;
  created_by: string;
  created_at: string;
};

export type ProjectMember = {
  id: string;
  project_id: string;
  user_id: string;
  role: "admin" | "member";
};

export async function createProject(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const parsed = createProjectSchema.parse({
    name: formData.get("name"),
    slug: slugify(formData.get("name") as string),
  });

  const { data: project, error: projectError } = await supabase
    .from("projects")
    .insert({
      name: parsed.name,
      slug: parsed.slug,
      created_by: user.id,
    })
    .select()
    .single();

  if (projectError) throw new Error(projectError.message);

  const { error: memberError } = await supabase
    .from("project_members")
    .insert({
      project_id: project.id,
      user_id: user.id,
      role: "admin",
    });

  if (memberError) throw new Error(memberError.message);

  revalidatePath("/projects");
  return project;
}

export async function getUserProjects() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data as Project[];
}

export async function getProjectBySlug(slug: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) throw new Error(error.message);
  return data as Project;
}

export async function inviteProjectMember(projectId: string, email: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase.rpc("add_project_member_by_email", {
    p_project_id: projectId,
    p_email: email,
    p_role: "member",
  });

  if (error) throw new Error(error.message);

  const result = data as { success: boolean; error?: string; user_id?: string; name?: string };

  if (!result.success) {
    throw new Error(result.error || "Failed to invite member");
  }

  revalidatePath("/projects", "layout");
  return result;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
