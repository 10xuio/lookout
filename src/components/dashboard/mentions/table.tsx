import { Suspense } from "react";
import { Table, TableBody, TableEmptyState } from "@/components/ui/table";
import { MentionsTableHeader } from "./header";
import { MentionsTableSkeleton } from "./table-skeleton";
import { MentionTableRow } from "./row";
import { getMentions } from "./actions";
import { AtSign } from "lucide-react";

async function MentionsTableContent({ topicId }: { topicId?: string }) {
  const mentions = await getMentions({ topicId });

  if (mentions.length === 0) {
    return (
      <TableEmptyState
        colSpan={8}
        title="No mentions found"
        description="Click 'Refresh Analysis' to analyze your existing prompt results for brand mentions."
        icon={AtSign}
      />
    );
  }

  return (
    <TableBody>
      {mentions.map((mention) => (
        <MentionTableRow key={mention.id} mention={mention} />
      ))}
    </TableBody>
  );
}

export function MentionsTable({ topicId }: { topicId?: string }) {
  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <MentionsTableHeader />
        <Suspense fallback={<MentionsTableSkeleton />}>
          <MentionsTableContent topicId={topicId} />
        </Suspense>
      </Table>
    </div>
  );
}
