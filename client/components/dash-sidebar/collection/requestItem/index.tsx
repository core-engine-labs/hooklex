import { memo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Request } from "@/types/request";
import { cn } from "@/lib/utils";

interface RequestItemProps {
  request: Request;
}

const methodColor: Record<string, string> = {
  GET: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  POST: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300",
  PUT: "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300",
  DELETE: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
  PATCH: "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300",
  HEAD: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300",
  CONNECT: "bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300",
  TRACE: "bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300",
  OPTIONS: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
};

export const RequestItem = memo(function RequestItem({ request }: RequestItemProps) {
  const pathname = usePathname();
  const requestUrl = `/dashboard/request/${request.id}`;
  const isSelected = pathname === requestUrl;

  return (
    <li
      className={cn(
        "group relative flex max-w-xs items-center justify-between rounded-md px-2 py-1.5 transition-all duration-150",
        isSelected
          ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium border-l-2 border-purple-700 shadow-xs pl-2.5"
          : "hover:bg-sidebar-accent/60 text-sidebar-foreground"
      )}
    >
      {/* Main item link wrapped properly to occupy full space */}
      <Link
        href={requestUrl}
        className="flex min-w-0 flex-1 items-center gap-2"
      >
        <span
          className={cn(
            "shrink-0 rounded-md px-2 py-0.5 text-xs font-semibold",
            methodColor[request.method] || "bg-primary text-primary-foreground"
          )}
        >
          {request.method}
        </span>

        <span
          className={cn(
            "truncate font-mono text-sm",
            isSelected ? "font-semibold text-primary" : "text-sidebar-foreground"
          )}
        >
          {request.ip || "/"}
        </span>

        {request.isReplay && (
          <span className="shrink-0 rounded-md bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-medium text-amber-500 border border-amber-500/20">
            REPLAY
          </span>
        )}
      </Link>
    </li>
  );
});
