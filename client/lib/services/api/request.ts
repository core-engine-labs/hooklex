import { SearchFormValues } from "@/hooks/useSearchRequests";
import { ApiResponse } from "@/types/api";
import { Request, SpecificRequest } from "@/types/request";

import { safeFetch } from "@/utils/safeFetch";

const Server_Url =
  process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:5000";

// --- 1. GET REQUEST    ---
export const getRequests = async ({
  cursor,
  limit,
  search,
  collectionId,
  filters,
}: {
  cursor: string;
  limit: number;
  search?: string;
  collectionId?: string;
  filters?: SearchFormValues["filters"];
}): Promise<
  ApiResponse<{
    requests: Array<Request>;
    nextCursor: string | null;
  }>
> => {
  const queryParams = new URLSearchParams();
  const effectiveCollectionId = collectionId || filters?.collectionId;
  if (effectiveCollectionId) {
    queryParams.append("collectionId", String(effectiveCollectionId));
  }
  if (filters) {
    const bytes = new TextEncoder().encode(JSON.stringify(filters));
    const binString = Array.from(bytes, (byte) =>
      String.fromCodePoint(byte),
    ).join("");
    const base64Unicode = btoa(binString);
    queryParams.append("filters", base64Unicode);
  }
  queryParams.append("cursor", cursor);
  queryParams.append("limit", String(limit));
  if (search) {
    queryParams.append("search", search);
  }
  return await safeFetch(
    `${Server_Url}/api/user/request?${queryParams.toString()}`,
    {
      method: "GET",
    },
  );
};

// --- 2. GET REQUEST    ---
export const getRequest = async (
  id: string,
): Promise<ApiResponse<SpecificRequest>> => {
  return await safeFetch(`${Server_Url}/api/user/request/${id}`, {
    method: "GET",
  });
};


