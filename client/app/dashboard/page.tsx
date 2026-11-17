import Link from "next/link";
import { MousePointerClick, BookOpen } from "lucide-react";

export default function Page() {
  return (
    <main className="flex h-[80vh] flex-1 flex-col items-center justify-center p-6 text-center">
      <div className="bg-muted text-muted-foreground mb-4 rounded-full p-4">
        <MousePointerClick className="h-8 w-8" />
      </div>
      <h1 className="text-xl font-semibold tracking-tight">No item selected</h1>
      <p className="text-muted-foreground mt-1 max-w-sm text-sm">
        Select a request from the sidebar or search results to view details.
      </p>

      {/* Quick Help Link */}
      <Link
        href="/docs/get-started"
        className="text-primary hover:underline mt-4 inline-flex items-center gap-1.5 text-sm font-medium"
      >
        <BookOpen className="h-4 w-4" />
        Learn how to use this tool
      </Link>
    </main>
  );
}