/* eslint-disable react-hooks/exhaustive-deps */
import { useRequestStore } from "@/lib/store/useRequestStore";
import { Request } from "@/types/request";
import { useCallback, useEffect } from "react";

const emptyState = {
  requests: [],
  loading: false,
  initialLoading: false,
  nextCursor: null,
  hasMore: true,
  fetched: false,
};


export function useRequests(collectionId: string, limit = 20) {
  const store = useRequestStore();
  const reqState = store.requestsMap[collectionId] || emptyState;

  const loadInitial = useCallback(() => {
    if (collectionId) store.loadInitialRequests(collectionId, limit);
  }, [collectionId, limit, store]);

  const loadMore = useCallback(() => {
    if (collectionId) store.loadMoreRequests(collectionId,limit);
  }, [collectionId, limit, store]);

  // Auto-load on mount
  useEffect(() => {
    if (collectionId && !reqState.fetched) {
      store.loadInitialRequests(collectionId,limit);
    }
  }, [collectionId, reqState.fetched]);


  return {
    requests: reqState.requests,
    loading: reqState.loading,
    hasMore: reqState.hasMore,
    loadMore,
    loadInitial,
    initialLoading: reqState.initialLoading,
    addRequest: (request: Request) => store.addRequest(collectionId, request),
    removeRequest: (requestId: string) =>
      store.removeRequest(collectionId, requestId),
  };
}
