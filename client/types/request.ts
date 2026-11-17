import { JsonValue } from "./json";

export interface Request {
  id: string;
  method: string;
  ip: string | null;
  isReplay: boolean;
}

export interface SpecificRequest {
  query: JsonValue;
  id: string;
  collectionId: string;
  method: string;
  path: string | null;
  headers: JsonValue;
  ip: string;
  contentType: string;
  body: string | null;
  bodySize: number;
  isReplay: boolean;
  replayedFrom: string | null;
  createdAt: Date;
}

export interface BodyExportContext {
  category: string;
  formattedBody: string;
  formParams?: [string, string][]|null;
  multipartParts?: Array<{
    name: string;
    value: string;
    isFile?: boolean;
    filename?: string;
    contentType?: string;
  }>;
}