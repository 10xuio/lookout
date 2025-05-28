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

interface TopicSelectorProps {
  topics: Topic[];
  currentTopicId?: string;
  placeholder?: string;
}

export function TopicSelectorSkeleton() {
  return <Skeleton className="w-6.5 h-6.5 rounded" />;
}

export function TopicSelector({ topics, currentTopicId }: TopicSelectorProps) {
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
                href={`/dashboard/rankings/${topic.id}`}
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
