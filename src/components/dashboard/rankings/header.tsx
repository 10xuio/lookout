import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import {
  MessageSquare,
  Trophy,
  Globe,
  Calendar,
  Settings,
  BarChart,
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
            <BarChart className="h-4 w-4" />
            Ranking
          </div>
        </TableHead>
        <TableHead>
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            Top Topics
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
            Completed
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
