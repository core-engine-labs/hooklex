/* eslint-disable @next/next/no-img-element */
import { toast } from "sonner";

export interface MediaBodyViewerProps {
  category: "image" | "audio" | "video" | "pdf";
  rawBody: string;
  contentType: string;
  isDataUrl: boolean;
  pdfUrl: string;
}

export function MediaBodyViewer({
  category,
  rawBody,
  contentType,
  isDataUrl,
  pdfUrl,
}: MediaBodyViewerProps) {
  const src = isDataUrl ? rawBody : `data:${contentType};base64,${rawBody}`;

  if (category === "image") {
    return (
      <div className="flex flex-col items-center p-4">
        <img
          src={src}
          alt="Request body image"
          className="max-h-[500px] max-w-full rounded-md border object-contain"
          onError={() => toast.error("Failed to load image")}
        />
      </div>
    );
  }

  if (category === "audio") {
    return (
      <div className="flex flex-col items-center p-4">
        <audio controls className="w-full max-w-md">
          <source src={src} type={contentType} />
          Your browser does not support the audio element.
        </audio>
      </div>
    );
  }

  if (category === "video") {
    return (
      <div className="flex flex-col items-center p-4">
        <video controls className="max-h-[500px] max-w-full rounded-md border">
          <source src={src} type={contentType} />
          Your browser does not support the video element.
        </video>
      </div>
    );
  }

  if (category === "pdf") {
    if (!pdfUrl) {
      return (
        <div className="flex flex-col items-center justify-center p-8 text-muted-foreground">
          <p className="text-sm">Loading PDF preview...</p>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center p-4">
        <object
          data={pdfUrl}
          type={contentType || "application/pdf"}
          className="h-[500px] w-full rounded-md border"
        >
          <p className="p-4 text-center text-sm text-muted-foreground">
            PDF preview not supported directly in this browser layout.
          </p>
        </object>
      </div>
    );
  }

  return null;
}
