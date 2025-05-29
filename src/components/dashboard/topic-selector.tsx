import Link from "next/link";
import { SquareDashed } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { Topic } from "@/types/topic";
import { Skeleton } from "@/components/ui/skeleton";
import { ImageAvatar } from "@/components/brand-list";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getTopics } from "./topics/actions";

interface TopicSelectorProps {
  topics: Topic[];
  currentTopicId?: string;
  placeholder?: string;
  url: string;
}

export function TopicSelectorSkeleton() {
  return <Skeleton className="w-6.5 h-6.5 rounded" />;
}

export function TopicSelectLogo({
  topics,
  currentTopicId,
  url,
}: TopicSelectorProps) {
  const selectedTopic = topics.find((topic) => topic.id === currentTopicId);

  return (
    <Popover>
      <PopoverTrigger className="flex items-center gap-1">
        {selectedTopic?.logo ? (
          <ImageAvatar url={selectedTopic.logo} title={selectedTopic.name} />
        ) : (
          <span className="bg-muted-foreground/10 rounded w-6.5 h-6.5 flex border border-border items-center justify-center">
            <SquareDashed className="h-4 w-4 text-muted-foreground" />
          </span>
        )}
      </PopoverTrigger>
      <PopoverContent className="p-0 w-40" align="start">
        <div className="max-h-[300px] overflow-y-auto">
          {topics.length === 0 ? (
            <div className="p-3 text-sm text-muted-foreground">
              No topics available
            </div>
          ) : (
            topics.map((topic) => (
              <Link
                key={topic.id}
                href={`${url}/${topic.id}`}
                prefetch={false}
                className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors border-b last:border-b-0"
              >
                {topic.logo && (
                  <ImageAvatar url={topic.logo} title={topic.name} />
                )}
                <span className="truncate">{topic.name}</span>
              </Link>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export async function TopicSelect({
  label,
  currentTopicId,
}: {
  label: string;
  currentTopicId?: string;
}) {
  const topics = await getTopics();

  return (
    <div className="grid gap-2">
      <label htmlFor="topicId" className="text-sm font-medium">
        {label}
      </label>
      <Select name="topicId" required defaultValue={currentTopicId}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select a topic..." />
        </SelectTrigger>
        <SelectContent>
          {topics.map((topic) => (
            <SelectItem key={topic.id} value={topic.id}>
              {topic.logo && (
                <ImageAvatar url={topic.logo} title={topic.name} />
              )}
              <span className="truncate">{topic.name}</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
