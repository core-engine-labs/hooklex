import { create } from "zustand";
import { Collection } from "@/types/collection";
import { getCollection } from "@/lib/services/api/collection";
import { toast } from "sonner";
import { useRequestStore } from "./useRequestStore";

type CollectionStore = {
  // State
  collections: Collection[];
  loading: boolean;
  initialLoading: boolean;
  nextCursor: string | null;
  hasMore: boolean;

  // Actions
  fetchCollections: (cursor?: string, limit?: number) => Promise<void>;
  loadMoreCollections: (limit?: number) => Promise<void>;
  addCollection: (collection: Collection) => void;
  removeCollection: (id: string) => void;
  moveCollection: (fromIndex: number, toIndex: number) => void;
};

export const useCollectionStore = create<CollectionStore>((set, get) => ({
  collections: [],
  loading: false,
  initialLoading: true,
  nextCursor: null,
  hasMore: true,

  fetchCollections: async (cursor, limit = 10) => {
    // Prevent concurrent fetches
    if (get().loading) return;

    if (cursor != undefined) {
      set({ loading: true });
    }

    try {
      const res = await getCollection({ cursor: cursor || "", limit });
      if (res.success) {
        const fetched = res.data?.collections || [];
        const nextCursor = res.data?.nextCursor || null;
        set((state) => {
          // Append on pagination, replace on fresh load
          const merged = cursor ? [...state.collections, ...fetched] : fetched;

          // Deduplicate by id (safety net)
          const uniqueCollections = Array.from(
            new Map(merged.map((item) => [item.id, item])).values(),
          );

          return {
            collections: uniqueCollections,
            nextCursor,
            hasMore: nextCursor !== null,
          };
        });
      } else {
        toast.error(res.message || "Failed to load collections");
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message || "Error fetching collections");
      }
    } finally {
      if (cursor != undefined) {
        set({ loading: false });
      } else {
        set({ initialLoading: false });
      }
    }
  },

  loadMoreCollections: async (limit = 10) => {
    const { loading, hasMore, nextCursor } = get();
    if (loading || !hasMore || !nextCursor) return;
    await get().fetchCollections(nextCursor, limit);
  },

  addCollection: (collection) => {
    set((state) => {
      // Prevent duplicates
      if (state.collections.some((c) => c.id === collection.id)) return state;
      return { collections: [collection, ...state.collections] };
    });
  },

  removeCollection: async (id: string) => {
    const collectionExists = get().collections.some((c) => c.id === id);
    if (!collectionExists) {
      return;
    }
    const location = window.location.pathname;
    if (location.includes(`/dashboard/request`)) {
      const requestId = location.split("/")[3];
      console.log("Request ID:", requestId);
      if (requestId) {
        const request = useRequestStore
          .getState()
          .requestsMap[id]?.requests.find((r) => r.id === requestId);
        if (request) {
          window.location.href = "/dashboard";
        }
      }
    }
    set((state) => ({
      collections: state.collections.filter((c) => c.id !== id),
    }));
    toast.info("Collection deleted");
  },

  moveCollection: (fromIndex, toIndex) => {
    set((state) => {
      const { collections } = state;
      if (
        fromIndex < 0 ||
        fromIndex >= collections.length ||
        toIndex < 0 ||
        toIndex >= collections.length
      ) {
        return state;
      }
      const updated = [...collections];
      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, moved);
      return { collections: updated };
    });
  },
}));
