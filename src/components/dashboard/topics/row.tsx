import { TableCell, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { AtSign, Eye, Trash2 } from "lucide-react";
import Link from "next/link";
import type { Topic } from "@/types/topic";
import { ImageAvatar } from "@/components/brand-list";
import { deleteTopic } from "./actions";
import { LoadingButton } from "@/components/loading-button";

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
      <TableCell>
        <div className="flex items-center gap-2 font-medium max-w-xs">
          {topic.logo && <ImageAvatar title={topic.name} url={topic.logo} />}
          {topic.name}
        </div>
      </TableCell>
      <TableCell>
        <span className="font-medium max-w-xs overflow-hidden whitespace-normal break-words">
          {topic.description}
        </span>
      </TableCell>
      <TableCell>{topic.isActive ? "Active" : "Inactive"}</TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Link href={`/dashboard/rankings/${topic.id}`}>
            <Button variant="outline" size="sm" className="gap-2">
              <Eye aria-label="View rankings" className="h-4 w-4" />
            </Button>
          </Link>
          <Link href={`/dashboard/mentions/${topic.id}`}>
            <Button variant="outline" size="sm" className="gap-2">
              <AtSign aria-label="View mentions" className="h-4 w-4" />
            </Button>
          </Link>
          <form action={handleDelete}>
            <LoadingButton>
              <Trash2 aria-label="Delete topic" className="h-4 w-4" />
            </LoadingButton>
          </form>
        </div>
      </TableCell>
    </TableRow>
  );
}
