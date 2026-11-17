"use client";

import { useState } from "react";
import Editor, { OnMount } from "@monaco-editor/react";

interface JsonCodeEditorProps {
  value: string;
  onChange?: (val: string) => void;
  readOnly?: boolean;
  height?: string;
  language?: string
}

export function JsonCodeEditor({
  value,
  onChange,
  readOnly = false,
  height = "180px",
  language
}: JsonCodeEditorProps) {
  const [isValidJson, setIsValidJson] = useState(true);

  // Auto-format JSON content on mount if read-only or raw string passed
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleEditorDidMount: OnMount = (editor, _) => {
    if (readOnly) {
      setTimeout(() => {
        editor.getAction("editor.action.formatDocument")?.run();
      }, 150);
    }
  };

  return (
    <div className="space-y-1">
      <div className="rounded-md border border-border overflow-hidden bg-[#1e1e1e]">
        <Editor
          height={height}
          defaultLanguage={language || "json"}
          theme="vs-dark"
          value={value}
          onMount={handleEditorDidMount}
          onChange={(val) => {
            if (readOnly) return;
            const currentVal = val || "";
            onChange?.(currentVal);

            try {
              JSON.parse(currentVal);
              setIsValidJson(true);
            } catch {
              setIsValidJson(false);
            }
          }}
          options={{
            readOnly: readOnly,
            domReadOnly: readOnly,
            minimap: { enabled: false },
            fontSize: 13,
            fontFamily: "monospace",
            scrollBeyondLastLine: false,
            wordWrap: "on",
            automaticLayout: true,
            formatOnPaste: true,
            formatOnType: true,
            renderValidationDecorations: "on",
            cursorStyle: readOnly ? "line-thin" : "line",
            folding: true, // Allows expanding/collapsing JSON blocks
            lineNumbers: "on",
          }}
        />
      </div>

      {!readOnly && !isValidJson && (
        <p className="text-xs font-medium text-destructive">
          Invalid JSON syntax. Fix highlighted editor errors before saving.
        </p>
      )}
    </div>
  );
}