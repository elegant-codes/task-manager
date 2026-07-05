import { AlertCircle, ArrowUpCircle, ArrowRightCircle, ArrowDownCircle, MinusCircle } from "lucide-react";

const priorityConfig: Record<
  string,
  { label: string; icon: React.ElementType; colorClass: string; bgClass: string }
> = {
  urgent: {
    label: "Urgent",
    icon: AlertCircle,
    colorClass: "text-priority-text-urgent",
    bgClass: "bg-priority-urgent",
  },
  high: {
    label: "High",
    icon: ArrowUpCircle,
    colorClass: "text-priority-text-high",
    bgClass: "bg-priority-high",
  },
  medium: {
    label: "Medium",
    icon: ArrowRightCircle,
    colorClass: "text-priority-text-medium",
    bgClass: "bg-priority-medium",
  },
  low: {
    label: "Low",
    icon: ArrowDownCircle,
    colorClass: "text-priority-text-low",
    bgClass: "bg-priority-low",
  },
  none: {
    label: "No Priority",
    icon: MinusCircle,
    colorClass: "text-muted-foreground",
    bgClass: "bg-secondary/50",
  },
};

export function PriorityBadge({ priority }: { priority: string }) {
  if (!priority || priority === "none") return null;

  const config = priorityConfig[priority] ?? priorityConfig.none;
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
