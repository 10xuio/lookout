import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Lightbulb } from "lucide-react";
import { CreateTopicDialog } from "./create-dialog";
import { TopicSuggestionsDialog } from "./suggestions-dialog";

export function TopicsToolbar() {
  return (
    <div className="flex items-center justify-between">
      <div className="relative min-w-xs">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search by topic name" className="pl-9" />
      </div>
      <div className="flex items-center gap-2">
        <TopicSuggestionsDialog>
          <Button variant="outline" size="sm" className="gap-2">
            <Lightbulb className="h-4 w-4" />
            Suggestions
          </Button>
        </TopicSuggestionsDialog>
        <CreateTopicDialog>
          <Button variant="default" size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Create Topic
          </Button>
        </CreateTopicDialog>
      </div>
    </div>
  );
}
