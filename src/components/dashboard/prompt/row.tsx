import { TableCell, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { BrandList } from "@/components/brand-list";
import { PromptTags } from "./tags";
import { ProcessButton } from "./process-button";
import { ResultsDialog } from "./results-dialog";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import type { Prompt } from "@/types/prompt";
import { formatRelative } from "date-fns";

interface PromptTableRowProps {
  prompt: Prompt;
}

export function PromptTableRow({ prompt }: PromptTableRowProps) {
  return (
    <TableRow>
      <TableCell>
        <Checkbox />
      </TableCell>
      <TableCell className="font-medium max-w-xs">{prompt.content}</TableCell>
      <TableCell>
        <span className="font-medium">{prompt.visibilityScore}</span>
      </TableCell>
      <TableCell>
        <BrandList brands={prompt.top} />
      </TableCell>
      <TableCell>
        <PromptTags tags={prompt.tags} />
      </TableCell>
      <TableCell>{prompt.geoRegion.toUpperCase()}</TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {prompt.completedAt
          ? formatRelative(new Date(), new Date(prompt.completedAt))
          : "Pending"}
      </TableCell>
      <TableCell>
        <div className="flex gap-2">
          <ProcessButton promptId={prompt.id} status={prompt.status} />
          {prompt.status === "completed" && (
            <ResultsDialog promptId={prompt.id} promptContent={prompt.content}>
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4" />
              </Button>
            </ResultsDialog>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}
