const statusConfig: Record<
  string,
  { label: string; dot: string; bg: string }
> = {
  backlog: {
    label: "Backlog",
    dot: "bg-status-backlog",
    bg: "bg-status-backlog/10 text-status-backlog",
  },
  todo: {
    label: "To Do",
    dot: "bg-status-todo",
    bg: "bg-status-todo/10 text-status-todo",
  },
  in_progress: {
    label: "In Progress",
    dot: "bg-status-in-progress",
    bg: "bg-status-in-progress/10 text-status-in-progress",
  },
  done: {
    label: "Done",
    dot: "bg-status-done",
    bg: "bg-status-done/10 text-status-done",
  },
  archived: {
    label: "Archived",
    dot: "bg-status-archived",
    bg: "bg-status-archived/10 text-status-archived",
  },
};

export function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] ?? statusConfig.backlog;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium leading-4 ${config.bg}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}
