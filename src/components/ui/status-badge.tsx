import { Circle, CircleDashed, CheckCircle2, Clock, Archive } from "lucide-react";

const statusConfig: Record<
  string,
  { label: string; icon: React.ElementType; colorClass: string; bgClass: string }
> = {
  backlog: {
    label: "Backlog",
    icon: CircleDashed,
    colorClass: "text-status-text-backlog",
    bgClass: "bg-status-backlog",
  },
  todo: {
    label: "To Do",
    icon: Circle,
    colorClass: "text-status-text-todo",
    bgClass: "bg-status-todo",
  },
  in_progress: {
    label: "In Progress",
    icon: Clock,
    colorClass: "text-status-text-in-progress",
    bgClass: "bg-status-in-progress",
  },
  done: {
    label: "Done",
    icon: CheckCircle2,
    colorClass: "text-status-text-done",
    bgClass: "bg-status-done",
  },
  archived: {
    label: "Archived",
    icon: Archive,
    colorClass: "text-status-text-archived",
    bgClass: "bg-status-archived",
  },
};

export function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] ?? statusConfig.backlog;
  const Icon = config.icon;

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider ${config.bgClass} ${config.colorClass} transition-colors`}
    >
      <Icon className="w-3 h-3" />
      <span>{config.label}</span>
    </div>
  );
}
