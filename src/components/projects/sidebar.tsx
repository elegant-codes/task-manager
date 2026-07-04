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
        <h2 className="font-semibold text-lg">Task Manager</h2>
        <p className="text-sm text-muted-foreground truncate mt-1">{userName}</p>
      </div>

      <Separator />

      <nav className="flex-1 overflow-y-auto p-2 space-y-1">
        <Link
          href="/projects"
          className={`block px-3 py-2 rounded-md text-sm transition-colors ${
            pathname === "/projects" ? "bg-secondary text-secondary-foreground" : "hover:bg-secondary"
          }`}
        >
          All projects
        </Link>
        <Link
          href="/projects/invitations"
          className={`block px-3 py-2 rounded-md text-sm transition-colors ${
            pathname === "/projects/invitations" ? "bg-secondary text-secondary-foreground" : "hover:bg-secondary"
          }`}
        >
          Invitations
        </Link>

        {projects.map((project) => (
          <Link
            key={project.id}
            href={`/projects/${project.slug}`}
            className={`block px-3 py-2 rounded-md text-sm transition-colors ${
              pathname === `/projects/${project.slug}`
                ? "bg-secondary text-secondary-foreground font-medium"
                : "hover:bg-secondary"
            }`}
          >
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
