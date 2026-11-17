"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { SpecificRequest } from "@/types/request";
import { getRequest } from "@/lib/services/api/request";
import {
  detectCategory,
  getformParams,
  parseMultipartData,
} from "@/utils/exportHelper";

import { RequestHeader } from "./header";
import { RequestMetadata } from "./meta-data";
import { RequestTabs } from "./tabs";
import { RequestExportDropdown } from "./export-dropdown";
import { RequestErrorCard } from "./error";
import { RequestDetailSkeleton } from "./skeleton";

export function RequestDetailView({
  id,
}: {
  id: string;
}) {
  const [request, setRequest] = useState<SpecificRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{
    status?: number;
    message: string;
  } | null>(null);
  const [shareLoading, setShareLoading] = useState(false);

  const category = useMemo(
    () => detectCategory(request?.contentType || ""),
    [request],
  );
  const rawBody = request?.body || "";

  const decodedRawBody = useMemo(() => {
    if (rawBody.startsWith("data:") && rawBody.includes(";base64,")) {
      try {
        const base64Part = rawBody.split(";base64,")[1];
        return atob(base64Part);
      } catch {
        return rawBody;
      }
    }
    return rawBody;
  }, [rawBody]);

  const multipartParts = useMemo(() => {
    if (category !== "multipart") return [];
    return parseMultipartData(decodedRawBody, request?.contentType || "");
  }, [category, decodedRawBody, request]);

  const formParams = useMemo(
    () => getformParams(category, rawBody),
    [category, rawBody],
  );

  const fetchRequest = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getRequest(id);
      if (response.success) {
        if (response.data) {
          setRequest(response.data);
        } else {
          setError({ status: 404, message: "Request not found." });
        }
      } else {
        setError({ status: response.status, message: response.message });
        if (response.status === 429) {
          toast.error("Too many requests. Please slow down.");
        } else if (response.status === 401 || response.status === 403) {
          toast.error("Permission denied.");
        } else {
          toast.error(response.message || "Failed to load request.");
        }
      }
    } catch {
      setError({ message: "An unexpected error occurred." });
      toast.error("Failed to load request.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      fetchRequest();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchRequest]);

  if (loading) {
    return <RequestDetailSkeleton />;
  }

  if (error) {
    return <RequestErrorCard error={error} />;
  }

  if (!request) return null;

  const exportContext = {
    category,
    formattedBody: rawBody,
    formParams,
    multipartParts,
  };

  return (
    <main className="m-4 px-4 flex-1">
      <section className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Request Details</h1>
        <RequestExportDropdown
          request={request}
          exportContext={exportContext}
        />
      </section>

      <section className="space-y-6">
        <RequestHeader method={request.method} path={request.path} />

        <RequestMetadata
          ip={request.ip}
          contentType={request.contentType}
          bodySize={request.bodySize}
          createdAt={request.createdAt}
          isReplay={request.isReplay}
          replayedFrom={request.replayedFrom}
        />

        <Separator />

        <RequestTabs
          headers={request.headers}
          query={request.query}
          body={request.body}
          contentType={request.contentType}
          bodySize={request.bodySize}
        />
      </section>
    </main>
  );
}
