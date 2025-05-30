import { Suspense } from "react";
import { Table, TableBody, TableEmptyState } from "@/components/ui/table";
import { PromptsTableHeader } from "./header";
import { PromptsTableSkeleton } from "./skeleton";
import { PromptTableRow } from "./row";
import { getPrompts } from "./actions";
import { Bot } from "lucide-react";

async function PromptsTableContent({ topicId }: { topicId?: string }) {
  const prompts = await getPrompts(topicId);

  if (prompts.length === 0) {
    return (
      <TableEmptyState
        colSpan={7}
        title="No prompts found"
        description="Start by creating your first prompt to see it appear here."
        icon={Bot}
      />
    );
  }

  return (
    <TableBody>
      {prompts.map((prompt) => (
        <PromptTableRow key={prompt.id} prompt={prompt} />
      ))}
    </TableBody>
  );
}

export function PromptsTable({ topicId }: { topicId?: string }) {
  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <PromptsTableHeader />
        <Suspense fallback={<PromptsTableSkeleton />}>
          <PromptsTableContent topicId={topicId} />
        </Suspense>
      </Table>
    </div>
  );
}
