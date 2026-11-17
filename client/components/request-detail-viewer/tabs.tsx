import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { JsonCodeEditor } from "../json-code-editor";
import { RequestBodyViewer } from "./request-body";
import { SpecificRequest } from "@/types/request";

export interface RequestTabsProps {
  headers: SpecificRequest["headers"];
  query: SpecificRequest["query"];
  body: string | null;
  contentType: string;
  bodySize: number;
}

export function RequestTabs({
  headers,
  query,
  body,
  contentType,
  bodySize,
}: RequestTabsProps) {
  return (
    <Tabs defaultValue="headers" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="headers">Headers</TabsTrigger>
        <TabsTrigger value="query">Query Params</TabsTrigger>
        <TabsTrigger value="body">Body</TabsTrigger>
      </TabsList>
      <TabsContent value="headers" className="pt-4">
        <JsonCodeEditor
          value={JSON.stringify(headers, null, 2)}
          readOnly
          height="200px"
        />
      </TabsContent>
      <TabsContent value="query" className="pt-4">
        <JsonCodeEditor
          value={JSON.stringify(query, null, 2)}
          readOnly
          height="200px"
        />
      </TabsContent>
      <TabsContent value="body" className="pt-4">
        <RequestBodyViewer
          body={body}
          contentType={contentType}
          bodySize={bodySize}
        />
      </TabsContent>
    </Tabs>
  );
}
