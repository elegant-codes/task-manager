"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { createClient } from "@/lib/supabase/client";
import { getUserProjects, type Project } from "@/actions/projects";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Moon, Sun } from "lucide-react";
import { CreateProjectDialog } from "@/components/projects/create-project-dialog";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
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
    <aside className="w-64 border-r border-border/50 flex flex-col h-full bg-card">
      <div className="p-5">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center shadow-sm">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-white"
            >
              <rect x="3" y="3" width="7" height="7" rx="2" />
              <rect x="14" y="3" width="7" height="7" rx="2" />
              <rect x="14" y="14" width="7" height="7" rx="2" />
              <rect x="3" y="14" width="7" height="7" rx="2" />
            </svg>
          </div>
          <span className="font-bold text-base text-foreground">
            Task Manager
          </span>
        </div>
        <p className="text-xs text-muted-foreground truncate font-medium pl-1">{userName}</p>
      </div>

      <div className="px-4 py-2">
        <Separator className="bg-border/50" />
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
        <Link
          href="/projects"
          className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 ${
            pathname === "/projects"
              ? "bg-primary/10 text-primary font-semibold"
              : "text-muted-foreground hover:text-foreground hover:bg-secondary/50 font-medium"
          }`}
        >
          <svg width="18" height="18" viewBox="0 0 16 16" fill="none" className="shrink-0">
            <rect x="1" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
            <rect x="9" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
            <rect x="9" y="9" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
            <rect x="1" y="9" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
          </svg>
          Projects
        </Link>
        <Link
          href="/projects/invitations"
          className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 ${
            pathname === "/projects/invitations"
              ? "bg-primary/10 text-primary font-semibold"
              : "text-muted-foreground hover:text-foreground hover:bg-secondary/50 font-medium"
          }`}
        >
          <svg width="18" height="18" viewBox="0 0 16 16" fill="none" className="shrink-0">
            <circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.5" />
            <path d="M2 15c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="14" cy="4" r="2.5" fill="var(--color-destructive)" />
          </svg>
          Invitations
        </Link>

        {projects.length > 0 && (
          <div className="pt-4 pb-1 pl-3 text-xs font-bold text-muted-foreground/70 uppercase tracking-wider">
            Your Projects
          </div>
        )}
        
        {projects.map((project) => (
          <Link
            key={project.id}
            href={`/projects/${project.slug}`}
            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 ${
              pathname === `/projects/${project.slug}`
                ? "bg-primary/10 text-primary font-semibold"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary/50 font-medium"
            }`}
          >
            <div className={`h-2 w-2 rounded-full ${pathname === `/projects/${project.slug}` ? 'bg-primary' : 'bg-muted-foreground/40'}`} />
            {project.name}
          </Link>
        ))}
      </nav>

      <div className="px-4 py-2">
        <Separator className="bg-border/50" />
      </div>

      <div className="p-4 space-y-2">
        <CreateProjectDialog />
        <div className="flex gap-2">
          <Button variant="ghost" className="flex-1 justify-start text-muted-foreground hover:text-card-foreground" onClick={handleSignOut}>
            Sign out
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 text-muted-foreground hover:text-card-foreground"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            title="Toggle theme"
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </div>
      </div>
    </aside>
  );
}
