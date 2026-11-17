import DashSidebar from "@/components/dash-sidebar";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="flex-row md:flex h-full w-full bg-background text-foreground">
        <DashSidebar />
        {children}
      </div>
    </>
  );
}
