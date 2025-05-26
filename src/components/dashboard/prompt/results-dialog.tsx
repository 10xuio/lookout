"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

interface LLMResult {
  id: string;
  model: string;
  response: string;
  status: string;
  errorMessage?: string;
  completedAt?: string;
}

interface ResultsDialogProps {
  promptId: string;
  promptContent: string;
  children: React.ReactNode;
}

export function ResultsDialog({
  promptId,
  promptContent,
  children,
}: ResultsDialogProps) {
  const [results, setResults] = useState<LLMResult[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchResults = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/prompts/${promptId}/results`);
      if (response.ok) {
        const data = await response.json();
        setResults(data.results || []);
      }
    } catch (error) {
      console.error("Failed to fetch results:", error);
    } finally {
      setLoading(false);
    }
  };

  const getModelDisplayName = (model: string) => {
    switch (model) {
      case "openai":
        return "OpenAI GPT-4";
      case "claude":
        return "Claude 3.5 Sonnet";
      case "google":
        return "Gemini 1.5 Pro";
      default:
        return model;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "failed":
        return "bg-red-100 text-red-800";
      case "processing":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild onClick={fetchResults}>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>LLM Results</DialogTitle>
          <DialogDescription>
            Results from all providers for: &ldquo;{promptContent}&rdquo;
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {results.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No results available yet. Process the prompt first.
              </p>
            ) : (
              results.map((result) => (
                <div key={result.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-lg">
                      {getModelDisplayName(result.model)}
                    </h3>
                    <Badge className={getStatusColor(result.status)}>
                      {result.status}
                    </Badge>
                  </div>

                  {result.status === "completed" && result.response ? (
                    <div className="prose prose-sm max-w-none">
                      <div className="whitespace-pre-wrap text-sm">
                        {result.response}
                      </div>
                    </div>
                  ) : result.status === "failed" && result.errorMessage ? (
                    <div className="text-red-600 text-sm">
                      Error: {result.errorMessage}
                    </div>
                  ) : (
                    <div className="text-muted-foreground text-sm">
                      No response available
                    </div>
                  )}

                  {result.completedAt && (
                    <div className="text-xs text-muted-foreground mt-2">
                      Completed: {new Date(result.completedAt).toLocaleString()}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
