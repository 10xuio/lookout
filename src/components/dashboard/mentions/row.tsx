import { TableCell, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Smile, Frown, Meh } from "lucide-react";
import { formatRelative } from "date-fns";
import { ImageAvatar } from "@/components/brand-list";
import { Mention } from "@/types/mentions";

const getSentimentIcon = ({
  sentiment,
}: {
  sentiment: "positive" | "negative" | "neutral";
}) => {
  switch (sentiment) {
    case "positive":
      return <Smile className="h-4 w-4 text-green-600" />;
    case "negative":
      return <Frown className="h-4 w-4 text-red-600" />;
    case "neutral":
      return <Meh className="h-4 w-4 text-gray-600" />;
  }
};

export function MentionTableRow({ mention }: { mention: Mention }) {
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
      <TableCell className="capitalize">{mention.mentionType}</TableCell>
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
      <TableCell className="text-sm text-muted-foreground capitalize">
        {formatRelative(new Date(mention.createdAt), new Date())}
      </TableCell>
    </TableRow>
  );
}
