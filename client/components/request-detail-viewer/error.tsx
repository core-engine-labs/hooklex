import { FileQuestion, ShieldAlert, Clock, AlertCircle, ArrowLeft, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export interface RequestErrorCardProps {
  error: { status?: number; message: string };
}

export function RequestErrorCard({ error }: RequestErrorCardProps) {
  const is404 = error.status === 404;
  const isAuthError = error.status === 401 || error.status === 403;
  const isRateLimited = error.status === 429;

  const getErrorIcon = (status?: number) => {
    switch (status) {
      case 404:
        return <FileQuestion className="h-6 w-6 text-amber-500" />;
      case 401:
      case 403:
        return <ShieldAlert className="h-6 w-6 text-red-500" />;
      case 429:
        return <Clock className="h-6 w-6 text-orange-500" />;
      default:
        return <AlertCircle className="h-6 w-6 text-red-500" />;
    }
  };

  const title = is404
    ? "Request Not Found"
    : isAuthError
      ? "Permission Denied"
      : isRateLimited
        ? "Rate Limit Exceeded"
        : "Something Went Wrong";

  const description =
    error.message ||
    (is404
      ? "This request may have been deleted, expired, or never existed."
      : isAuthError
        ? "You don't have permission to view this request details."
        : isRateLimited
          ? "You've made too many requests recently. Please wait a moment and try again."
          : "An error occurred while fetching the request. Please try again.");

  return (
    <div className="flex-1 min-h-[400px] flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-border/60 shadow-sm">
        <CardContent className="pt-6 text-center space-y-4">
          <div className="mx-auto w-12 h-12 rounded-full bg-muted/60 flex items-center justify-center">
            {getErrorIcon(error.status)}
          </div>

          <div className="space-y-1.5">
            <h3 className="font-semibold text-lg tracking-tight text-foreground">
              {title}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {description}
            </p>
          </div>

          <div className="pt-2 flex items-center justify-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.history.back()}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Go Back
            </Button>

            {!is404 && !isAuthError && (
              <Button
                variant="default"
                size="sm"
                onClick={() => window.location.reload()}
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Try Again
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
