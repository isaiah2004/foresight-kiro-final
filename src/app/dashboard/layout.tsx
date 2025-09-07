import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { SidebarStateProvider } from '@/providers/sidebar-state-provider';
import { cookies } from 'next/headers';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";

  return (
    <SidebarStateProvider>
      <SidebarProvider defaultOpen={defaultOpen}>
        <AppSidebar />
        <main className="flex-1 overflow-auto ">
          {children}
        </main>
      </SidebarProvider>
    </SidebarStateProvider>
  );
}