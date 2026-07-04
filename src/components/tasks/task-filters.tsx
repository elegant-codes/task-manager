"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { List, Columns3 } from "lucide-react";

export function TaskFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const status = searchParams.get("status") || "";
  const priority = searchParams.get("priority") || "";
  const view = searchParams.get("view") || "list";

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  function setView(newView: string) {
    updateParam("view", newView);
  }

  return (
    <div className="flex items-center gap-2 mb-4 flex-wrap">
      <Select value={status} onValueChange={(v) => updateParam("status", v ?? "")}>
        <SelectTrigger className="w-32 h-8 text-xs">
          <SelectValue placeholder="All statuses" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">All statuses</SelectItem>
          <SelectItem value="backlog">Backlog</SelectItem>
          <SelectItem value="todo">To Do</SelectItem>
          <SelectItem value="in_progress">In Progress</SelectItem>
          <SelectItem value="done">Done</SelectItem>
          <SelectItem value="archived">Archived</SelectItem>
        </SelectContent>
      </Select>

      <Select value={priority} onValueChange={(v) => updateParam("priority", v ?? "")}>
        <SelectTrigger className="w-32 h-8 text-xs">
          <SelectValue placeholder="All priorities" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">All priorities</SelectItem>
          <SelectItem value="none">None</SelectItem>
          <SelectItem value="low">Low</SelectItem>
          <SelectItem value="medium">Medium</SelectItem>
          <SelectItem value="high">High</SelectItem>
          <SelectItem value="urgent">Urgent</SelectItem>
        </SelectContent>
      </Select>

      <div className="flex-1" />

      <div className="flex items-center border border-border rounded-md">
        <Button
          variant={view === "list" ? "secondary" : "ghost"}
          size="sm"
          className="h-8 px-2 rounded-none rounded-l-md"
          onClick={() => setView("list")}
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          variant={view === "board" ? "secondary" : "ghost"}
          size="sm"
          className="h-8 px-2 rounded-none rounded-r-md"
          onClick={() => setView("board")}
        >
          <Columns3 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
