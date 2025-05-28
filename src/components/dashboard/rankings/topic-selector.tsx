import Link from "next/link";
import { ChevronDown } from "lucide-react";
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
  return (
    <div className="flex items-center gap-2 w-28">
      <Skeleton className="w-6.5 h-6.5 rounded" />
      <Skeleton className="flex-1 h-6 rounded" />
    </div>
  );
}

export function TopicSelector({
  topics,
  currentTopicId,
  placeholder = "Select a topic",
}: TopicSelectorProps) {
  const selectedTopic = topics.find((topic) => topic.id === currentTopicId);

  return (
    <Popover>
      <PopoverTrigger className="flex items-center gap-1 w-28">
        {selectedTopic ? (
          <div className="flex items-center gap-2">
            {selectedTopic.logo && (
              <ImageAvatar
                url={selectedTopic.logo}
                title={selectedTopic.name}
              />
            )}
            <span className="truncate">{selectedTopic.name}</span>
          </div>
        ) : (
          <span className="text-muted-foreground truncate">{placeholder}</span>
        )}
        <ChevronDown className="h-4 w-4 opacity-50" />
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
                href={`?topicId=${topic.id}`}
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
