export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-[#1a2a3a]">
      <div className="w-full max-w-sm mx-auto p-6">
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-2.5 mb-1">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <svg
                width="18"
                height="18"
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
            <span className="text-lg font-semibold text-card-foreground">
              Task Manager
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Collaborate. Track. Ship.
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
