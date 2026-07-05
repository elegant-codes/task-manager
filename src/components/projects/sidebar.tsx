"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getUserProjects, type Project } from "@/actions/projects";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CreateProjectDialog } from "@/components/projects/create-project-dialog";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;
    const channels: RealtimeChannel[] = [];

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user || cancelled) return;

      if (user?.user_metadata?.name) {
        setUserName(user.user_metadata.name);
      } else if (user?.email) {
        setUserName(user.email);
      }

      const channel = supabase
        .channel(`sidebar:${user.id}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "project_members",
            filter: `user_id=eq.${user.id}`,
          },
          () => {
            getUserProjects().then(setProjects).catch(console.error);
          }
        )
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "project_members",
            filter: `user_id=eq.${user.id}`,
          },
          () => {
            getUserProjects().then(setProjects).catch(console.error);
          }
        )
        .subscribe();

      channels.push(channel);
    });

    getUserProjects().then(setProjects).catch(console.error);

    return () => {
      cancelled = true;
      channels.forEach((ch) => supabase.removeChannel(ch));
    };
  }, [pathname]);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="w-60 border-r border-border flex flex-col h-full bg-card">
      <div className="p-4">
        <div className="flex items-center gap-2 mb-1">
          <div className="h-7 w-7 rounded-md bg-primary flex items-center justify-center">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-primary-foreground"
            >
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
            </svg>
          </div>
          <span className="font-semibold text-sm text-card-foreground">Task Manager</span>
        </div>
        <p className="text-xs text-muted-foreground truncate">{userName}</p>
      </div>

      <Separator />

      <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
        <Link
          href="/projects"
          className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-all duration-150 ${
            pathname === "/projects"
              ? "bg-primary/10 text-primary font-medium"
              : "text-muted-foreground hover:text-card-foreground hover:bg-secondary"
          }`}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
            <rect x="1" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
            <rect x="9" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
            <rect x="9" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
            <rect x="1" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
          </svg>
          Projects
        </Link>
        <Link
          href="/projects/invitations"
          className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-all duration-150 ${
            pathname === "/projects/invitations"
              ? "bg-primary/10 text-primary font-medium"
              : "text-muted-foreground hover:text-card-foreground hover:bg-secondary"
          }`}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
            <circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.5" />
            <path d="M2 15c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="14" cy="4" r="2" fill="var(--color-danger)" opacity="0.8" />
          </svg>
          Invitations
        </Link>

        {projects.map((project) => (
          <Link
            key={project.id}
            href={`/projects/${project.slug}`}
            className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-all duration-150 ${
              pathname === `/projects/${project.slug}`
                ? "bg-primary/10 text-primary font-medium"
                : "text-muted-foreground hover:text-card-foreground hover:bg-secondary"
            }`}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="shrink-0">
              <rect x="0.5" y="0.5" width="11" height="11" rx="1.5" stroke="currentColor" strokeWidth="1" />
            </svg>
            {project.name}
          </Link>
        ))}
      </nav>

      <Separator />

      <div className="p-2 space-y-2">
        <CreateProjectDialog />
        <Button variant="ghost" className="w-full justify-start" onClick={handleSignOut}>
          Sign out
        </Button>
      </div>
    </aside>
  );
}
