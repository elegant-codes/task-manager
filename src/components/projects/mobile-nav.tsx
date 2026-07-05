"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getUserProjects, type Project } from "@/actions/projects";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { CreateProjectDialog } from "@/components/projects/create-project-dialog";
import { Menu } from "lucide-react";

export function MobileNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [userName, setUserName] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.user_metadata?.name) {
        setUserName(user.user_metadata.name);
      } else if (user?.email) {
        setUserName(user.email);
      }
    });

    getUserProjects().then(setProjects).catch(console.error);
  }, [pathname]);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  function handleNav() {
    setOpen(false);
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={<Button variant="ghost" size="icon" className="md:hidden" />}
      >
        <Menu className="h-5 w-5" />
      </SheetTrigger>
      <SheetContent side="left" className="w-60 p-0">
        <SheetHeader className="p-4 pb-0">
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
            <SheetTitle className="text-sm text-left">Task Manager</SheetTitle>
          </div>
          <p className="text-xs text-muted-foreground truncate">{userName}</p>
        </SheetHeader>
        <Separator className="mt-4" />
        <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
          <Link
            href="/projects"
            onClick={handleNav}
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
            onClick={handleNav}
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
              onClick={handleNav}
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
      </SheetContent>
    </Sheet>
  );
}
