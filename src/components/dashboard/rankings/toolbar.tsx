import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Lightbulb } from "lucide-react";
import { CreatePromptDialog } from "./create-dialog";
import { SuggestionsDialog } from "./suggestions-dialog";

interface PromptToolbarProps {
  topicId?: string;
}

export function PromptToolbar({ topicId }: PromptToolbarProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="relative min-w-xs">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search by prompt name" className="pl-9" />
      </div>
      <div className="flex items-center gap-2">
        <CreatePromptDialog>
          <Button variant="default" size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Add Prompt
          </Button>
        </CreatePromptDialog>
        <SuggestionsDialog topicId={topicId}>
          <Button variant="outline" size="sm" className="gap-2">
            <Lightbulb className="h-4 w-4" />
            Suggestions
          </Button>
        </SuggestionsDialog>
      </div>
    </div>
  );
}
