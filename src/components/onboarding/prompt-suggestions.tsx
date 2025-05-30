import { getTopics } from "@/components/dashboard/topics/actions";
import { generatePromptSuggestions } from "@/lib/suggestions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles } from "lucide-react";

interface PromptSuggestionsProps {
  topicId: string;
}

export async function PromptSuggestions({ topicId }: PromptSuggestionsProps) {
  const topics = await getTopics();
  const topic = topics.find((t) => t.id === topicId);

  if (!topic) return null;

  const suggestions = await generatePromptSuggestions(
    topic.name,
    topic.description || undefined
  );

  // Show only first 2 suggestions
  const displaySuggestions = suggestions.slice(0, 2);

  async function handleSelectSuggestion(formData: FormData) {
    "use server";

    const content = formData.get("content") as string;
    const topicId = formData.get("topicId") as string;

    const { createPrompt } = await import(
      "@/components/dashboard/rankings/actions"
    );
    const { revalidatePath } = await import("next/cache");

    const result = await createPrompt({
      content,
      topicId,
      geoRegion: "global",
    });

    if (result.success) {
      revalidatePath("/dashboard");
    }
  }

  if (displaySuggestions.length === 0) {
    // Fallback suggestions if AI generation fails
    const fallbackSuggestions = [
      {
        content: "best project management software",
        description: "Track visibility for project management tools searches",
      },
      {
        content: "affordable web hosting providers",
        description: "Monitor rankings in the web hosting space",
      },
    ];

    return (
      <div className="grid gap-3">
        {fallbackSuggestions.map((suggestion, index) => (
          <form key={index} action={handleSelectSuggestion}>
            <input type="hidden" name="content" value={suggestion.content} />
            <input type="hidden" name="topicId" value={topicId} />
            <Card className="cursor-pointer hover:border-primary transition-colors">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <p className="font-medium text-sm">{suggestion.content}</p>
                    <p className="text-xs text-muted-foreground">
                      {suggestion.description}
                    </p>
                  </div>
                  <Button
                    type="submit"
                    size="sm"
                    variant="ghost"
                    className="ml-2"
                  >
                    Select
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {displaySuggestions.map((suggestion) => (
        <form key={suggestion.id} action={handleSelectSuggestion}>
          <input type="hidden" name="content" value={suggestion.content} />
          <input type="hidden" name="topicId" value={topicId} />
          <Card className="cursor-pointer hover:border-primary transition-colors">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm">{suggestion.content}</p>
                    <Sparkles className="h-3 w-3 text-primary" />
                  </div>
                  {suggestion.description && (
                    <p className="text-xs text-muted-foreground">
                      {suggestion.description}
                    </p>
                  )}
                </div>
                <Button
                  type="submit"
                  size="sm"
                  variant="ghost"
                  className="ml-2"
                >
                  Select
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      ))}
    </div>
  );
}
