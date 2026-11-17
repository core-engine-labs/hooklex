/* eslint-disable @typescript-eslint/no-explicit-any */

import { useWatch } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, X, RotateCcw } from "lucide-react";
import { Virtuoso } from "react-virtuoso";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useCollections } from "@/hooks/useCollections";
import { useSearchRequests } from "@/hooks/useSearchRequests";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Collection {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  description: string | null;
  token: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const REQUEST_ITEM_HEIGHT = 32;
const MAX_VISIBLE_ROWS = 5;

// ─── Component ────────────────────────────────────────────────────────────────

interface CollectionSearchCardProps {
  /** Controlled open state — passed from SidebarInteractiveContent */
  isOpen: boolean;
  /** Called when user clicks the backdrop or the internal close button */
  onClose: () => void;
}

export default function CollectionSearchCard({
  isOpen,
  onClose,
}: CollectionSearchCardProps) {
  const { collections } = useCollections(10) as { collections: Collection[] };

  const {
    form,
    results,
    loading,
    initialLoading,
    hasMore,
    loadMore,
    handleSearch,
    handleReset,
  } = useSearchRequests();

  const { register, handleSubmit, setValue, control, reset } = form;

  const searchValue = useWatch({ control, name: "search" });
  const selectedCollectionId = useWatch({
    control,
    name: "filters.collectionId",
  });
  const selectedMethod = useWatch({ control, name: "filters.method" });
  const isReplayedChecked = useWatch({ control, name: "filters.isReplayed" });


  const requestsListHeight =
    Math.min(
      results.length * REQUEST_ITEM_HEIGHT,
      MAX_VISIBLE_ROWS * REQUEST_ITEM_HEIGHT,
    ) || REQUEST_ITEM_HEIGHT;

  const handleClearAll = () => {
    handleReset();
    reset();
  };

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

  // Don't mount the overlay at all when closed
  if (!isOpen) return null;

  return (
    /*
     * Overlay backdrop — fixed, full-screen.
     * We do NOT set a z-index class here; instead we rely on the natural
     * stacking order (this element is appended late in the DOM) and use
     * `isolation: isolate` so Radix portals (rendered into <body>) can
     * still appear on top without fighting a hard z-index.
     */
    <div
      className="fixed inset-0 flex items-center justify-center bg-background/90 backdrop-blur-3xl z-2"
      style={{ isolation: "isolate" }}
      onClick={(e) => {
        // Close when clicking the backdrop (not the card itself)
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <Card className="w-full max-w-[650px] max-h-[85vh] flex flex-col gap-0 mx-4 sm:mx-0 shadow-2xl">
        <CardHeader className="shrink-0 pb-3">
          <CardTitle className="flex items-center justify-between text-base sm:text-lg">
            <div className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Search Requests
            </div>
            {/* Close button */}
            <button
              type="button"
              onClick={onClose}
              className="rounded-md p-1 hover:bg-muted transition-colors"
              aria-label="Close search"
            >
              <X className="h-4 w-4" />
            </button>
          </CardTitle>
          <CardDescription>
            Note: All fields are optional but at least one field is required for
            searching
          </CardDescription>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto space-y-4 px-4 sm:px-6 pb-6">
          {/* Filter Form */}
          <form
            onSubmit={handleSubmit(async (data, e) => {
              e?.preventDefault();
              await handleSearch(data);
            })}
            className="space-y-4"
          >
            {/* Search input */}
            <div className="relative mt-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, URL, or content..."
                className="pl-9 pr-10 h-9 text-sm"
                {...register("search")}
              />
              {searchValue && (
                <button
                  type="button"
                  onClick={() => setValue("search", "")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              {/* Collection Select */}
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs">Collection</Label>
                {/*
                 * SelectContent uses a Radix portal into <body> by default,
                 * so it renders above everything. No manual z-index needed.
                 */}
                <Select
                  value={
                    collections.find((col) => col.id == selectedCollectionId)
                      ?.name || "all"
                  }
                  onValueChange={(val) => {
                    setValue(
                      "filters.collectionId",
                      !val || val === "all" ? undefined : val,
                      { shouldDirty: true, shouldValidate: true },
                    );
                  }}
                >
                  <SelectTrigger className="h-9 w-full text-sm">
                    <SelectValue placeholder="All collections" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All collections</SelectItem>
                    {collections?.map((col) => (
                      <SelectItem key={col.id} value={col.id}>
                        {col.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* HTTP Method Select */}
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs">HTTP Method</Label>
                <Select
                  value={selectedMethod || "all"}
                  onValueChange={(val) => {
                    setValue(
                      "filters.method",
                      (!val || val === "all" ? undefined : val) as any,
                      { shouldDirty: true, shouldValidate: true },
                    );
                  }}
                >
                  <SelectTrigger className="h-9 w-full text-sm">
                    <SelectValue placeholder="All methods" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All methods</SelectItem>
                    {[
                      "GET",
                      "POST",
                      "PUT",
                      "DELETE",
                      "PATCH",
                      "HEAD",
                      "OPTIONS",
                      "TRACE",
                    ].map((method) => (
                      <SelectItem key={method} value={method}>
                        {method}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* IP Filter */}
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs">IP Contains</Label>
                <Input
                  placeholder="e.g. 192.168.1.1"
                  className="h-9 w-full text-sm"
                  {...register("filters.ip")}
                />
              </div>

              {/* Query Filter */}
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs">Query Contains</Label>
                <Input
                  placeholder="e.g. status=active"
                  className="h-9 w-full text-sm"
                  {...register("filters.query")}
                />
              </div>

              {/* Header Filter */}
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs">Header Contains</Label>
                <Input
                  placeholder="e.g. Authorization"
                  className="h-9 w-full text-sm"
                  {...register("filters.header")}
                />
              </div>

              {/* Body Filter */}
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs">Body Contains</Label>
                <Input
                  placeholder='e.g. {"success": true}'
                  className="h-9 w-full text-sm"
                  {...register("filters.body")}
                />
              </div>
            </div>

            {/* Replayed Checkbox */}
            <div className="flex items-center gap-3">
              <Checkbox
                id="isReplayed"
                checked={isReplayedChecked || false}
                onCheckedChange={(checked) => {
                  setValue("filters.isReplayed", checked as boolean, {
                    shouldDirty: true,
                    shouldValidate: true,
                  });
                }}
              />
              <Label htmlFor="isReplayed" className="text-xs cursor-pointer">
                Show only replayed requests
              </Label>
            </div>
           

            {/* Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pt-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleClearAll}
                className="w-full sm:w-auto"
              >
                <RotateCcw className="h-3.5 w-3.5 mr-1" /> Clear / Reset
              </Button>
              <Button type="submit" size="sm" className="w-full sm:w-auto">
                Search
              </Button>
            </div>
          </form>

          {/* Results */}
          <div className="border-t pt-3">
            {initialLoading ? (
              <div className="flex flex-col gap-1 py-1">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-2 py-1.5 px-2">
                    <Skeleton className="h-5 w-12 rounded-md" />
                    <Skeleton className="h-5 w-32 rounded-md" />
                  </div>
                ))}
              </div>
            ) : results.length === 0 ? (
              <div className="text-xs text-muted-foreground py-4 text-center">
                No requests found. Try adjusting your search or filters.
              </div>
            ) : (
              <Virtuoso
                style={{ height: Math.max(requestsListHeight, 120) }}
                data={results}
                itemContent={(_, request) => (
                  <Link
                    href={`/dashboard/request/${request.id}`}
                    onClick={onClose}
                    key={request.id}
                  >
                    <div className="flex items-center gap-2 py-1.5 px-2 hover:bg-muted/60 rounded text-xs ">
                      <Badge
                        variant="outline"
                        className={`font-mono text-[10px] uppercase shrink-0 ${methodColor[request.method] || "bg-primary text-primary-foreground"}`}
                      >
                        {request.method || "GET"}
                      </Badge>
                      <span className="truncate flex-1">{request.ip}</span>
                      {request.isReplay && (
                        <span className="shrink-0 rounded-md bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-medium text-amber-500 border border-amber-500/20">
                          REPLAY
                        </span>
                      )}
                    </div>
                  </Link>
                )}
                endReached={() => {
                  if (hasMore) loadMore();
                }}
                overscan={100}
                components={{
                  Footer: () =>
                    loading ? (
                      <div className="flex flex-col gap-1 py-1">
                        <Skeleton className="h-5 w-full" />
                      </div>
                    ) : null,
                }}
              />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
