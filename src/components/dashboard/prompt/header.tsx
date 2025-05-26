import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import {
  MessageSquare,
  Eye,
  Trophy,
  Tags,
  Globe,
  Calendar,
  Settings,
} from "lucide-react";

export function PromptsTableHeader() {
  return (
    <TableHeader>
      <TableRow className="hover:bg-transparent">
        <TableHead>
          <Checkbox />
        </TableHead>
        <TableHead>
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Prompt
          </div>
        </TableHead>
        <TableHead>
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Visibility
          </div>
        </TableHead>
        <TableHead>
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            Top
          </div>
        </TableHead>
        <TableHead>
          <div className="flex items-center gap-2">
            <Tags className="h-4 w-4" />
            Tags
          </div>
        </TableHead>
        <TableHead>
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Location
          </div>
        </TableHead>
        <TableHead>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Last Updated
          </div>
        </TableHead>
        <TableHead>
          <div className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Actions
          </div>
        </TableHead>
      </TableRow>
    </TableHeader>
  );
}
