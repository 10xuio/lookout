import { RefreshButton } from "./refresh-button";
import { analyzeMentions } from "./actions";
import { Stats } from "./stats";

export async function MentionsToolbar({ topicId }: { topicId?: string }) {
  const handleRefresh = async () => {
    "use server";
    await analyzeMentions();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Brand Mentions Analysis</h3>
          <p className="text-sm text-muted-foreground">
            Track how your brand appears across AI responses
          </p>
        </div>
        <form action={handleRefresh}>
          <RefreshButton />
        </form>
      </div>
      <Stats topicId={topicId} />
    </div>
  );
}
