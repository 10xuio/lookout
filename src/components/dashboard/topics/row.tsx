import { TableCell, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import Link from "next/link";
import type { Topic } from "@/types/topic";
import { ImageAvatar } from "@/components/brand-list";
import { DeleteButton } from "./delete-button";
import { deleteTopic } from "./actions";

interface TopicTableRowProps {
  topic: Topic;
}

export function TopicTableRow({ topic }: TopicTableRowProps) {
  const handleDelete = async () => {
    "use server";
    await deleteTopic(topic.id);
  };

  return (
    <TableRow>
      <TableCell>
        <Checkbox />
      </TableCell>
      <TableCell className="font-medium max-w-xs">
        <div className="flex items-center gap-2">
          {topic.logo && <ImageAvatar title={topic.name} url={topic.logo} />}
          {topic.name}
        </div>
      </TableCell>
      <TableCell>
        <span className="font-medium">{topic.description}</span>
      </TableCell>
      <TableCell>{topic.isActive ? "Active" : "Inactive"}</TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Link href={`/dashboard/rankings/${topic.id}`}>
            <Button variant="outline" size="sm" className="gap-2">
              <Eye className="h-4 w-4" />
              View Rankings
            </Button>
          </Link>
          <form action={handleDelete}>
            <DeleteButton />
          </form>
        </div>
      </TableCell>
    </TableRow>
  );
}
