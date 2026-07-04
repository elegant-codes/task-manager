import { Sidebar } from "@/components/projects/sidebar";
import { MobileNav } from "@/components/projects/mobile-nav";

export default function ProjectsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden">
      <div className="hidden md:flex">
        <Sidebar />
      </div>
      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="md:hidden flex items-center gap-2 border-b border-border p-3">
          <MobileNav />
          <h1 className="font-semibold">Task Manager</h1>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
