/* eslint-disable react-hooks/exhaustive-deps */
import { useCollectionStore } from "@/lib/store/useCollectionStore";
import { useEffect, useCallback } from "react";

export function useCollections(limit: number) {
  // Select individual stable primitives to avoid re-renders on every state change
  const initialLoading = useCollectionStore((s) => s.initialLoading);
  const loading = useCollectionStore((s) => s.loading);
  const hasMore = useCollectionStore((s) => s.hasMore);
  const collections = useCollectionStore((s) => s.collections);
  const fetchCollections = useCollectionStore((s) => s.fetchCollections);
  const loadMoreCollections = useCollectionStore((s) => s.loadMoreCollections);
  const addCollection = useCollectionStore((s) => s.addCollection);
  const removeCollection = useCollectionStore((s) => s.removeCollection);
  const moveCollection = useCollectionStore((s) => s.moveCollection);

  // Only run once on mount (when initialLoading is true meaning never loaded yet)
  useEffect(() => {

    fetchCollections(undefined, limit);

  }, []); // empty deps — only run on mount

  const loadMore = useCallback(() => {
    loadMoreCollections(limit);
  }, [limit]);

  return {
    collections,
    loading,
    hasMore,
    loadMore,
    initialLoading,
    addCollection,
    removeCollection,
    moveCollection,
  };
}
