import { Badge } from "@/components/ui/badge";

const methodColor: Record<string, string> = {
  GET: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  POST: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300",
  PUT: "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300",
  DELETE: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
  PATCH:
    "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300",
  HEAD: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300",
  CONNECT: "bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300",
  TRACE: "bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300",
  OPTIONS: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
};

const getMethodClasses = (method: string): string => {
  return (
    methodColor[method.toUpperCase()] || "bg-primary text-primary-foreground"
  );
};

export interface RequestHeaderProps {
  method: string;
  path: string | null;
}

export function RequestHeader({ method, path }: RequestHeaderProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 py-2">
      <div className="flex items-center gap-3">
        <Badge className={`${getMethodClasses(method)} font-mono`}>
          {method.toUpperCase()}
        </Badge>
        <span className="text-lg font-medium truncate max-w-[100px] sm:max-w-md">
          {path || "/"}
        </span>
      </div>
    </div>
  );
}
