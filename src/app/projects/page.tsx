"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { getUserProjects, type Project } from "@/actions/projects";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      getUserProjects()
        .then(setProjects)
        .catch(console.error)
        .finally(() => setLoading(false));
    });
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold mb-6">Projects</h1>
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <svg
          width="64"
          height="64"
          viewBox="0 0 64 64"
          fill="none"
          className="mb-6 text-muted-foreground"
        >
          <rect
            x="8"
            y="12"
            width="48"
            height="40"
            rx="4"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
          <path
            d="M20 26h24M20 34h16M20 42h8"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.5"
          />
          <circle cx="48" cy="48" r="12" fill="var(--color-primary)" opacity="0.15" />
          <path
            d="M44 48h8M48 44v8"
            stroke="var(--color-primary)"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
        <h1 className="text-xl font-semibold text-card-foreground mb-1">
          Welcome to Task Manager
        </h1>
        <p className="text-sm text-muted-foreground mb-6 max-w-xs">
          Create your first project to get started.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Projects</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <Link key={project.id} href={`/projects/${project.slug}`}>
            <Card className="transition-all duration-150 hover:shadow-elevated hover:-translate-y-0.5 cursor-pointer">
              <CardHeader>
                <CardTitle className="text-card-foreground">{project.name}</CardTitle>
                <CardDescription>
                  Created {new Date(project.created_at).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
