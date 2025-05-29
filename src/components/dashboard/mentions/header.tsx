import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Target,
  TrendingUp,
  MessageSquare,
  Bot,
  Calendar,
  Hash,
  FileText,
} from "lucide-react";

export function MentionsTableHeader() {
  return (
    <TableHeader>
      <TableRow className="hover:bg-transparent">
        <TableHead>
          <Checkbox />
        </TableHead>
        <TableHead className="w-1/8">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Topic
          </div>
        </TableHead>
        <TableHead className="w-1/8">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Type
          </div>
        </TableHead>
        <TableHead className="w-1/8">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Sentiment
          </div>
        </TableHead>
        <TableHead>
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Extracted Text
          </div>
        </TableHead>
        <TableHead className="w-1/8">
          <div className="flex items-center gap-2">
            <Bot className="h-4 w-4" />
            Model
          </div>
        </TableHead>
        <TableHead className="w-1/8">
          <div className="flex items-center gap-2">
            <Hash className="h-4 w-4" />
            Position
          </div>
        </TableHead>
        <TableHead className="w-1/8">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Created
          </div>
        </TableHead>
      </TableRow>
    </TableHeader>
  );
}
