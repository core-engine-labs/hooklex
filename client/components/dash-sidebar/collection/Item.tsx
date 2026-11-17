import { useState } from "react";
import {
  ChevronDown,
  MoreVertical,
  ArrowUp,
  ArrowDown,
  Trash2,
  Copy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Virtuoso } from "react-virtuoso";
import { RequestItem } from "./requestItem";
import { cn } from "@/lib/utils";
import { Collection } from "@/types/collection";
import { useRequests } from "@/hooks/useRequests";
import { useCollectionStore } from "@/lib/store/useCollectionStore";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { DeleteCollection } from "@/lib/services/api/collection";

interface CollectionItemProps {
  collection: Collection;
  index: number;
  totalCollections: number;
}

export function CollectionItem({
  collection,
  index,
  totalCollections,
}: CollectionItemProps) {
  const [expanded, setExpanded] = useState(false);
  const moveCollection = useCollectionStore((state) => state.moveCollection);
   const removeCollection = useCollectionStore((state) => state.removeCollection);
  const { requests, loading, hasMore, loadMore, loadInitial, initialLoading } =
    useRequests(collection.id);

  const toggle = () => {
    const newExpanded = !expanded;
    setExpanded(newExpanded);
    if (newExpanded && !initialLoading) {
      loadInitial();
    }
  };

  const tokenSnippet = `${process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:5000"}/wh/${collection.token}`;

  const handleDeleteCollection = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const res= await DeleteCollection(collection.id)
    try {
      if (res.success) {
        await removeCollection(collection.id);
        return
      }
      toast.error(res.message || "Delete failed");
      return
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message || "Error deleting");
      }
    }
  };

  const handleMoveUp = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (index > 0) {
      moveCollection(index, index - 1);
    }
  };

  const handleMoveDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (index < totalCollections - 1) {
      moveCollection(index, index + 1);
    }
  };

  // Clamp the Virtuoso height: each request row ≈ 32px, max 5 visible rows = 160px
  const REQUEST_ITEM_HEIGHT = 32;
  const MAX_VISIBLE_ROWS = 5;
  const requestsListHeight =
    Math.min(
      requests.length * REQUEST_ITEM_HEIGHT,
      MAX_VISIBLE_ROWS * REQUEST_ITEM_HEIGHT,
    ) || REQUEST_ITEM_HEIGHT;

  return (
    <>
      <div className="flex flex-col">
        {/* Collection Header */}
        <div
          className="flex items-center justify-between py-1.5 px-2 hover:bg-sidebar-accent rounded-md transition-colors cursor-pointer group"
          onClick={toggle}
          role="button"
          aria-expanded={expanded}
          aria-controls={`collection-${collection.id}-requests`}
          tabIndex={0}
        >
          <div className="flex items-center gap-2 overflow-hidden">
            <Tooltip>
              <TooltipTrigger>
                <span className="text-sm font-medium text-sidebar-foreground truncate">
                  {collection.name}
                </span>
              </TooltipTrigger>
              {collection.description && (
                <TooltipContent>
                  <p>{collection.description}</p>
                </TooltipContent>
              )}
            </Tooltip>
            <span
              role="button"
              tabIndex={0}
              onClick={(event: React.MouseEvent) => {
                event.stopPropagation();
                navigator.clipboard
                  .writeText(tokenSnippet)
                  .then(() => toast.success("Copied to clipboard!"))
                  .catch(() => toast.error("Failed to copy"));
              }}
              className="flex items-center gap-1 text-xs bg-sidebar-accent text-sidebar-accent-foreground px-2 py-0.5 rounded-md hover:bg-sidebar-accent transition-colors max-w-[120px] truncate"
            >
              <span className="truncate">{tokenSnippet}</span>
              <Copy className="w-3 h-3 flex-shrink-0" />
            </span>
          </div>
          <div className="flex items-center gap-1">
            <DropdownMenu>
              <DropdownMenuTrigger onClick={(e) => e.stopPropagation()}>
                <MoreVertical
                  className="h-4 w-4"
                  aria-label="Collection actions"
                />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                onClick={(e) => e.stopPropagation()}
              >
                <DropdownMenuItem
                  disabled={index === 0}
                  onClick={handleMoveUp}
                  className="gap-2"
                >
                  <ArrowUp className="h-4 w-4" /> Move Up
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  disabled={index === totalCollections - 1}
                  onClick={handleMoveDown}
                  className="gap-2"
                >
                  <ArrowDown className="h-4 w-4" /> Move Down
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleDeleteCollection}
                  className="gap-2 text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4" /> Delete Collection
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 shrink-0"
              aria-label="Toggle requests"
            >
              <ChevronDown
                className={cn(
                  "h-4 w-4 transition-transform duration-200",
                  expanded && "rotate-180",
                )}
              />
            </Button>
          </div>
        </div>

        {/* Requests List */}
        {expanded && (
          <div
            id={`collection-${collection.id}-requests`}
            className="ml-3 pl-3 border-l border-border/60"
            role="list"
          >
            {initialLoading ? (
              <div className="flex flex-col gap-1 py-1">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-2 py-1.5 px-2">
                    <Skeleton className="h-5 w-12 rounded-md" />
                    <Skeleton className="h-5 w-32 rounded-md" />
                  </div>
                ))}
              </div>
            ) : requests.length === 0 ? (
              <div className="text-xs text-muted-foreground py-2 px-2">
                No requests in this collection
              </div>
            ) : (
              // Virtuoso with its own scrollbar — height is clamped to MAX_VISIBLE_ROWS
              <Virtuoso
                style={{ height: requestsListHeight }}
                data={requests}
                itemContent={(_, request) => (
                  <RequestItem key={request.id} request={request} />
                )}
                endReached={() => {
                  if (hasMore) {
                    loadMore();
                  }
                }}
                overscan={100}
                components={{
                  Footer: () =>
                    loading ? (
                      <div className="flex flex-col gap-1 py-1">
                        <Skeleton className="h-5 w-full" />
                        <Skeleton className="h-5 w-full" />
                      </div>
                    ) : null,
                }}
              />
            )}
          </div>
        )}
      </div>
    </>
  );
}
