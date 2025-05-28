import { ImageAvatar } from "@/components/brand-list";
import { Button } from "@/components/ui/button";
import { SearchResult } from "@/lib/llm";
import { ExternalLink } from "lucide-react";

export function ResultItem({ result }: { result: SearchResult }) {
  return (
    <div className="group relative overflow-hidden rounded-lg border bg-card transition-all hover:shadow-md">
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            <ImageAvatar title={result.title} url={result.url} />
          </div>

          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <h4 className="font-medium text-sm leading-tight line-clamp-2">
                {result.title}
              </h4>
              {result.url && (
                <Button
                  asChild
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <a
                    href={result.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-3 w-3" />
                    <span className="sr-only">Open link</span>
                  </a>
                </Button>
              )}
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
              {result.snippet}
            </p>

            {result.url && (
              <p className="text-xs text-muted-foreground/70 truncate">
                {new URL(result.url).hostname}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
