import { create } from "zustand";
import { Request } from "@/types/request";
import { getRequests } from "@/lib/services/api/request";
import { toast } from "sonner";

// State for a single collection's requests
type RequestState = {
  requests: Request[];
  loading: boolean;
  initialLoading: boolean;
  nextCursor: string | null;
  hasMore: boolean;
  fetched: boolean;
};

type RequestStore = {
  // Map of collectionId -> RequestState
  requestsMap: Record<string, RequestState>;

  // Actions (all take collectionId)
  fetchRequests: (
    collectionId: string,
    cursor?: string,
    limit?: number,
  ) => Promise<void>;
  loadInitialRequests: (collectionId: string, limit?: number) => Promise<void>;
  loadMoreRequests: (collectionId: string, limit?: number) => Promise<void>;
  addRequest: (collectionId: string, request: Request) => void;
  removeRequest: (collectionId: string, requestId: string) => void;
};

// Default state for a collection that hasn't been loaded
const defaultState: RequestState = {
  requests: [],
  loading: false,
  initialLoading: false,
  nextCursor: null,
  hasMore: true,
  fetched: false,
};

export const useRequestStore = create<RequestStore>((set, get) => ({
  requestsMap: {},

  fetchRequests: async (collectionId, cursor, limit = 20) => {
    const current = get().requestsMap[collectionId] || defaultState;
    if (current.loading) return;

    // Mark as loading
    set((state) => ({
      requestsMap: {
        ...state.requestsMap,
        [collectionId]: { ...current, loading: true },
      },
    }));

    try {
      const res = await getRequests({
        cursor: cursor || "",
        limit,
        collectionId,
      });
      if (res.success) {
        const fetched = res.data?.requests || [];
        const prev = get().requestsMap[collectionId]?.requests || [];
        set((state) => ({
          requestsMap: {
            ...state.requestsMap,
            [collectionId]: {
              requests: cursor ? [...prev, ...fetched] : fetched,
              loading: false,
              initialLoading: false,
              nextCursor: res.data?.nextCursor || null,
              hasMore: !!res.data?.nextCursor,
              fetched: true,
            },
          },
        }));
      } else {
        toast.error(res.message || "Failed to load requests");
        // Reset loading
        set((state) => ({
          requestsMap: {
            ...state.requestsMap,
            [collectionId]: {
              ...(state.requestsMap[collectionId] || defaultState),
              loading: false,
              initialLoading: false,
            },
          },
        }));
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message || "Error fetching requests");
        set((state) => ({
          requestsMap: {
            ...state.requestsMap,
            [collectionId]: {
              ...(state.requestsMap[collectionId] || defaultState),
              loading: false,
              initialLoading: false,
            },
          },
        }));
      }
    }
  },

  loadInitialRequests: async (collectionId, limit = 20) => {
    const current = get().requestsMap[collectionId] || defaultState;
    // Fetch only if not fetched  changed
    if (!current.fetched) {
      set((state) => ({
        requestsMap: {
          ...state.requestsMap,
          [collectionId]: { ...defaultState, initialLoading: true },
        },
      }));
      await get().fetchRequests(collectionId, undefined, limit);
    }
  },

  loadMoreRequests: async (collectionId, limit = 20) => {
    const current = get().requestsMap[collectionId] || defaultState;
    if (!current.loading && current.hasMore && current.nextCursor) {
      await get().fetchRequests(collectionId, current.nextCursor, limit);
    }
  },

  addRequest: (collectionId, request) => {
    set((state) => {
      const current = state.requestsMap[collectionId] || defaultState;
      if (current.requests.some((r) => r.id === request.id)) return state;
      return {
        requestsMap: {
          ...state.requestsMap,
          [collectionId]: {
            ...current,
            requests: [request, ...current.requests],
          },
        },
      };
    });
  },

  removeRequest: (collectionId, requestId) => {
    set((state) => {
      const current = state.requestsMap[collectionId];
      if (!current) return state;
      return {
        requestsMap: {
          ...state.requestsMap,
          [collectionId]: {
            ...current,
            requests: current.requests.filter((r) => r.id !== requestId),
          },
        },
      };
    });
  },
}));
