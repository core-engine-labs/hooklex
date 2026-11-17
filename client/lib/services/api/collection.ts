import { ApiResponse } from "@/types/api";
import { Collection } from "@/types/collection";

import { safeFetch } from "@/utils/safeFetch";

const Server_Url =
  process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:5000";

// --- 1. GET COLLECTION ---
export const getCollection = async ({
  cursor,
  limit,
}: {
  cursor: string;
  limit: number;
}): Promise<
  ApiResponse<{
    collections: Array<Collection>;
    nextCursor: string | null;
  }>
> => {
  const queryParams = new URLSearchParams();

  if (cursor) {
    queryParams.append("cursor", cursor);
  }
  queryParams.append("limit", String(limit));

  return await safeFetch(
    `${Server_Url}/api/user/collection?${queryParams.toString()}`,
    {
      method: "GET",
    },
  );
};

// --- 2. CREATE COLLECTION ---
export const createCollection = async ({
  name,
  description,
}: {
  name: string;
  description?: string;
}): Promise<ApiResponse<Collection>> => {
  return await safeFetch(`${Server_Url}/api/user/collection`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify({ name, description }),
  });
};

// --- 3. DELETE COLLECTION ---
export const DeleteCollection = async (
  id: string,
): Promise<ApiResponse<null>> => {
  const queryParams = new URLSearchParams();
  queryParams.append("id", id);
  return await safeFetch(
    `${Server_Url}/api/user/collection?${queryParams.toString()}`,
    {
      method: "DELETE",
    },
  );
};
