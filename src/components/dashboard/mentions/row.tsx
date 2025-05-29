import { TableCell, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { formatRelative } from "date-fns";
import { ImageAvatar } from "@/components/brand-list";
import { Topic } from "@/types/topic";

interface MentionWithTopic {
  id: string;
  promptId: string;
  topicId: string;
  modelResultId: string;
  model: "openai" | "claude" | "google";
  mentionType: "direct" | "indirect" | "competitive";
  position: string | null;
  context: string;
  sentiment: "positive" | "negative" | "neutral";
  confidence: string | null;
  extractedText: string;
  createdAt: Date;
  topic: Topic;
}

interface MentionTableRowProps {
  mention: MentionWithTopic;
}

const getSentimentIcon = ({
  sentiment,
}: {
  sentiment: "positive" | "negative" | "neutral";
}) => {
  switch (sentiment) {
    case "positive":
      return <TrendingUp className="h-4 w-4 text-green-600" />;
    case "negative":
      return <TrendingDown className="h-4 w-4 text-red-600" />;
    case "neutral":
      return <Minus className="h-4 w-4 text-gray-600" />;
  }
};

export function MentionTableRow({ mention }: MentionTableRowProps) {
  return (
    <TableRow>
      <TableCell>
        <Checkbox />
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          {mention.topic.logo && (
            <ImageAvatar url={mention.topic.logo} title={mention.topic.name} />
          )}
          <span className="truncate">{mention.topic.name}</span>
        </div>
      </TableCell>
      <TableCell>{mention.mentionType}</TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          {getSentimentIcon({ sentiment: mention.sentiment })}
          <span className="capitalize text-sm">{mention.sentiment}</span>
        </div>
      </TableCell>
      <TableCell>
        <div className="max-w-xs">
          <p className="text-sm font-medium truncate">
            {mention.extractedText}
          </p>
          <p className="text-xs text-muted-foreground whitespace-normal break-words">
            {mention.context}
          </p>
        </div>
      </TableCell>
      <TableCell className="capitalize">{mention.model}</TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {mention.position ? `#${mention.position}` : "N/A"}
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {formatRelative(new Date(mention.createdAt), new Date())}
      </TableCell>
    </TableRow>
  );
}
