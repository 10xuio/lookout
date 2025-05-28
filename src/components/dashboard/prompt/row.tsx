import { TableCell, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { BrandList } from "@/components/brand-list";
import { ProcessButton } from "./process-button";
import { ResultsDialog } from "./results-dialog";
import { Button } from "@/components/ui/button";
import { Eye, Hash } from "lucide-react";
import type { Prompt } from "@/types/prompt";
import { formatRelative } from "date-fns";
import { deletePrompt } from "./actions";
import { DeleteButton } from "./delete-button";
import { cn, getVisibilityScoreColor } from "@/lib/utils";

interface PromptTableRowProps {
  prompt: Prompt;
}

export function PromptTableRow({ prompt }: PromptTableRowProps) {
  const handleDelete = async () => {
    "use server";
    await deletePrompt(prompt.id);
  };

  const visibilityScore = parseFloat(prompt.visibilityScore ?? "0");

  return (
    <TableRow>
      <TableCell>
        <Checkbox />
      </TableCell>
      <TableCell className="font-medium max-w-xs overflow-hidden whitespace-normal break-words">
        {prompt.content}
      </TableCell>
      <TableCell
        className={cn(
          "font-medium text-sm items-center align-middle",
          getVisibilityScoreColor(visibilityScore)
        )}
      >
        <div className="flex items-center">
          <Hash className="h-3.5 w-3.5 mr-1" /> {visibilityScore}%
        </div>
      </TableCell>
      <TableCell>
        <BrandList top={prompt.top} />
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {prompt.geoRegion.toUpperCase()}
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {prompt.completedAt
          ? formatRelative(new Date(prompt.completedAt), new Date())
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
          <form action={handleDelete}>
            <DeleteButton />
          </form>
        </div>
      </TableCell>
    </TableRow>
  );
}
