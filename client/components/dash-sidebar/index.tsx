import { Header } from "./header";
import { MobileSidebar } from "./mobile";
import Client from "./client";


async function SidebarContent() {
  return (
    <div className="flex h-screen flex-col p-4">
      <div className="flex flex-1 flex-col gap-6 min-h-0">
        <Header />
        <Client />
      </div>
    </div>
  );
}

export default async function DashSidebar() {
  return (
    <>
      {/* Mobile view handled via Client Component wrapper */}
      <MobileSidebar header={<Header />}>
        <SidebarContent />
      </MobileSidebar>

      {/* Desktop view rendered directly on Server */}
      <aside className="hidden min-h-full min-w-[360px] flex-col border-r-2   bg-sidebar text-sidebar-foreground md:flex">
        <SidebarContent />
      </aside>
    </>
  );
}
