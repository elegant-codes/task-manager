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
          <SheetTitle className="text-left">Task Manager</SheetTitle>
          <p className="text-sm text-muted-foreground truncate">{userName}</p>
        </SheetHeader>
        <Separator className="mt-4" />
        <nav className="flex-1 overflow-y-auto p-2 space-y-1">
          <Link
            href="/projects"
            onClick={handleNav}
            className={`block px-3 py-2 rounded-md text-sm transition-colors ${
              pathname === "/projects" ? "bg-secondary text-secondary-foreground" : "hover:bg-secondary"
            }`}
          >
            All projects
          </Link>
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/projects/${project.slug}`}
              onClick={handleNav}
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
      </SheetContent>
    </Sheet>
  );
}
