import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { MessageSquare, Eye, Settings, Check } from "lucide-react";

export function TopicsTableHeader() {
  return (
    <TableHeader>
      <TableRow className="hover:bg-transparent">
        <TableHead>
          <Checkbox />
        </TableHead>
        <TableHead className="w-1/6">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Topic
          </div>
        </TableHead>
        <TableHead>
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Description
          </div>
        </TableHead>
        <TableHead className="w-1/6">
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4" />
            Active
          </div>
        </TableHead>
        <TableHead className="w-1/6">
          <div className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Actions
          </div>
        </TableHead>
      </TableRow>
    </TableHeader>
  );
}
