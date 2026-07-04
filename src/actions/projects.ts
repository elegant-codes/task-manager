"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
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

  let finalSlug = parsed.slug;

  const { count } = await supabase
    .from("projects")
    .select("*", { count: "exact", head: true })
    .eq("slug", finalSlug);

  if (count && count > 0) {
    finalSlug = `${parsed.slug}-${Date.now().toString(36)}`;
  }

  const { data: project, error: projectError } = await supabase
    .from("projects")
    .insert({
      name: parsed.name,
      slug: finalSlug,
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

  const admin = createAdminClient();

  const { data: users, error: lookupError } = await admin.auth.admin.listUsers();

  if (lookupError) throw new Error("Failed to look up user");

  const invitedUser = users.users.find((u) => u.email === email);

  if (!invitedUser) {
    throw new Error("User with this email not found");
  }

  if (invitedUser.id === user.id) {
    throw new Error("You are already a member of this project");
  }

  const { data: existing } = await supabase
    .from("project_members")
    .select("id")
    .eq("project_id", projectId)
    .eq("user_id", invitedUser.id)
    .maybeSingle();

  if (existing) {
    throw new Error("User is already a member");
  }

  const { error: memberError } = await supabase
    .from("project_members")
    .insert({
      project_id: projectId,
      user_id: invitedUser.id,
      role: "member",
      status: "pending",
    });

  if (memberError) throw new Error("Failed to add member");

  revalidatePath("/projects", "layout");
  return {
    success: true,
    user_id: invitedUser.id,
    name: invitedUser.user_metadata?.name || email.split("@")[1],
  };
}

export type PendingInvitation = {
  id: string;
  project_id: string;
  project_name: string;
  project_slug: string;
};

export async function getPendingInvitations() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const admin = createAdminClient();

  const { data, error } = await admin
    .from("project_members")
    .select("id, project_id, projects!inner(name, slug)")
    .eq("user_id", user.id)
    .eq("status", "pending");

  if (error) throw new Error(error.message);

  return (data || []).map((item: Record<string, unknown>) => {
    const project = item.projects as { name: string; slug: string };
    return {
      id: item.id as string,
      project_id: item.project_id as string,
      project_name: project.name,
      project_slug: project.slug,
    } satisfies PendingInvitation;
  });
}

export async function respondToInvitation(
  invitationId: string,
  action: "accept" | "decline"
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  if (action === "accept") {
    const { error } = await supabase
      .from("project_members")
      .update({ status: "active" })
      .eq("id", invitationId)
      .eq("user_id", user.id);

    if (error) throw new Error("Failed to accept invitation");

    revalidatePath("/projects", "layout");
    revalidatePath("/invitations");
  } else {
    const { error } = await supabase
      .from("project_members")
      .update({ status: "declined" })
      .eq("id", invitationId)
      .eq("user_id", user.id);

    if (error) throw new Error("Failed to decline invitation");

    revalidatePath("/invitations");
  }
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
