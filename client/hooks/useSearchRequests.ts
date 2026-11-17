import { useState, useCallback, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { getRequests } from "@/lib/services/api/request";
import { toast } from "sonner";
import { Request as AppRequest } from "@/types/request";

// ─── Schema ──────────────────────────────────────────────────────────────────

const searchFormSchema = z.object({
  search: z.string().max(200).optional(),
  filters: z
    .object({
      method: z
        .enum(["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "TRACE", "OPTIONS"])
        .optional(),
      body: z.string().max(1000).optional(),
      header: z.string().max(500).optional(),
      query: z.string().max(500).optional(),
      ip: z.string().max(500).optional(),
      isReplayed: z.boolean().optional(),
      collectionId: z.string().optional(),
    })
    .optional(),
});

export type SearchFormValues = z.infer<typeof searchFormSchema>;

const DEFAULT_FORM_VALUES: SearchFormValues = {
  search: "",
  filters: {
    method: undefined,
    body: "",
    header: "",
    query: "",
    ip: "",
    isReplayed: false,
    collectionId: undefined,
  },
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

interface SearchState {
  filteredResults: AppRequest[];
  loading: boolean;
  initialLoading: boolean;
  nextCursor: string | null;
  hasMore: boolean;
}

const defaultSearchState: SearchState = {
  filteredResults: [],
  loading: false,
  initialLoading: false,
  nextCursor: null,
  hasMore: false,
};

export function useSearchRequests() {
  // ── open / close ────────────────────────────────────────────────────────────
  const [isOpen, setIsOpen] = useState(false);
  const toggle = useCallback(() => setIsOpen((v) => !v), []);
  const close = useCallback(() => setIsOpen(false), []);

  // ── form ────────────────────────────────────────────────────────────────────
  const form = useForm<SearchFormValues>({
    resolver: zodResolver(searchFormSchema),
    defaultValues: DEFAULT_FORM_VALUES,
    mode: "onChange",
  });

  // ── search state ────────────────────────────────────────────────────────────
  const [state, setState] = useState<SearchState>(defaultSearchState);

  // Track the params used for the active search so loadMore knows what to page with
  const activeParamsRef = useRef<{ search: string } | null>(null);
  // Track the active client-side filters for re-applying on loadMore
  const activeFiltersParamsRef = useRef<SearchFormValues["filters"]>(undefined);

  // ── API helpers ─────────────────────────────────────────────────────────────

  const fetchPage = useCallback(
    async (search: string, cursor: string | null, isInitial: boolean) => {
      setState((prev) => ({
        ...prev,
        loading: true,
        initialLoading: isInitial,
      }));

      try {
        const res = await getRequests({
          cursor: cursor ?? "",
          limit: 20,
          search,
          filters: activeFiltersParamsRef.current,
        });

        if (res.success) {
          const fetched = res.data?.requests ?? [];
          const nextCursor = res.data?.nextCursor ?? null;

          setState((prev) => {
            const combined = isInitial
              ? fetched
              : [...prev.filteredResults, ...fetched];
            return {
              filteredResults: combined,
              loading: false,
              initialLoading: false,
              nextCursor,
              hasMore: !!nextCursor,
            };
          });
        } else {
          toast.error(res.message || "Failed to search requests");
          setState((prev) => ({
            ...prev,
            loading: false,
            initialLoading: false,
          }));
        }
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "Error searching requests";
        toast.error(msg);
        setState((prev) => ({
          ...prev,
          loading: false,
          initialLoading: false,
        }));
      }
    },
    [],
  );

  // ── submit (initial search) ─────────────────────────────────────────────────
  const handleSearch = useCallback(
    (data: SearchFormValues) => {
      const searchStr = data.search?.trim() ?? "";
      // Safely check if EVERY filter value is exactly null
      const isAllFiltersNull = Object.entries(data?.filters ?? {}).every(
        ([, value]) => {
          return (
            value === null ||
            value === undefined ||
            value === "" ||
            value === false
          );
        },
      );

      if (!searchStr && isAllFiltersNull) {
        toast.error("At least one field is required for searching requests");
        return;
      }

      activeParamsRef.current = { search: searchStr };
      activeFiltersParamsRef.current = data.filters;

      fetchPage(searchStr, null, true);
    },
    [fetchPage],
  );

  // ── load more (pagination) ─────────────────────────────────────────────────
  const loadMore = useCallback(() => {
    if (!state.hasMore || state.loading || !activeParamsRef.current) return;
    const { search } = activeParamsRef.current;
    fetchPage(search, state.nextCursor, false);
  }, [state.hasMore, state.loading, state.nextCursor, fetchPage]);

  // ── reset ──────────────────────────────────────────────────────────────────
  const handleReset = useCallback(() => {
    form.reset(DEFAULT_FORM_VALUES);
    activeParamsRef.current = null;
    activeFiltersParamsRef.current = undefined;
    setState(defaultSearchState);
  }, [form]);

  return {
    // open state
    isOpen,
    toggle,
    close,
    // form
    form,
    DEFAULT_FORM_VALUES,
    // results
    results: state.filteredResults,
    loading: state.loading,
    initialLoading: state.initialLoading,
    hasMore: state.hasMore,
    // actions
    handleSearch,
    loadMore,
    handleReset,
  };
}
