import { ApiResponse } from "@/types/api";

type methodType = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface FetchOptions {
  method: methodType;
  headers?: {
    [key: string]: unknown;
  };
  body?: string;
  next?: {
    tags: [string];
    revalidate: number;
  };
  [key: string]: unknown;
}

export async function safeFetch(
  url: string,
  options: FetchOptions,
): Promise<ApiResponse> {
  const defaultHeaders = {
    "Content-Type": "application/json",
  };

  try {
    const { headers: optionHeaders, ...restOptions } = options || {};

    const response = await fetch(url, {
      ...restOptions, // Spreads method, body, next, etc. safely without raw credentials
      headers: {
        ...defaultHeaders,
        ...(optionHeaders as Record<string, string>),
      },
    });

    const textData = await response.text();
    let jsonData = null;

    try {
      if (textData && textData.trim().startsWith("{")) {
        jsonData = JSON.parse(textData);
      }
    } catch {
      // Ignore invalid JSON responses (e.g. server HTML error pages)
    }

    if (!response.ok) {
      if (process.env.NODE_ENV !== "production") {
        console.error(`🚨 Backend API Failure [${options.method}] ${url}:`, {
          status: response.status,
          statusText: response.statusText,
          serverError: jsonData?.message || textData,
        });
      }
      let userMessage =
        "Our system is experiencing difficulties. Please try again.";

      switch (response.status) {
        case 400:
          userMessage =
            jsonData?.message || "The request contains invalid information.";
          break;
        case 401:
          userMessage =
            "Action failed. Your session may have expired. Please sign out and sign in again.";
          break;
        case 403:
          userMessage =
            jsonData?.message ||
            "You don't have permission to perform this action.";
          break;
        case 404:
          userMessage =
            jsonData?.message || "The requested resource was not found.";
          break;
        case 409:
          userMessage =
            jsonData?.message || "This operation conflicts with existing data.";
          break;
        case 429:
          userMessage = "Too many requests. Please try again in a moment.";
          break;

        // --- SERVER DOWN / CRASH HANDLERS ---
        case 500:
        case 502:
        case 503:
        case 504:
          // Instead of returning an object, THROW an error to trigger error.tsx
          throw new Error(`Something went wrong: Status ${response.status}`);

        default:
          if (response.status >= 500) {
            throw new Error(`Something went wrong: Status ${response.status}`);
          }
      }
      return {
        success: false,
        message: userMessage,
        status: response.status,
        code: jsonData.code,
      };
    }

    return jsonData;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (networkError: any) {
    // If we deliberately threw a SERVER_CRASHED error above, pass it along
    if (networkError?.message?.includes("SERVER_CRASHED")) {
      throw networkError;
    }

    console.error(`❌ Network Exception while fetching ${url}:`, networkError);

    // Detect if the server is completely down (ECONNREFUSED / fetch failed)
    const isServerOffline =
      networkError?.code === "ECONNREFUSED" ||
      networkError?.message?.includes("fetch failed") ||
      networkError?.message?.includes("Failed to fetch");

    if (isServerOffline) {
      // Centralized crash command: This terminates the cycle and forces error.tsx to show up
      throw new Error(
        "Something went wrong: Connection refused by target backend host.",
      );
    }

    // Fallback for standard client-side network dropping (like losing Wi-Fi)
    return {
      success: false,
      message:
        "Unable to connect to web servers. Check your internet connection.",
      status: 500,
    };
  }
}
