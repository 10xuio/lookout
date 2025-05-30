import { LoadingButton } from "@/components/loading-button";
import { analyzeMentions } from "./actions";
import { Stats } from "./stats";
import { RefreshCw } from "lucide-react";

export async function MentionsToolbar({ topicId }: { topicId?: string }) {
  const handleRefresh = async () => {
    "use server";
    await analyzeMentions();
  };

  return (
    <div className="space-y-4">
      <form action={handleRefresh} className="flex justify-end">
        <LoadingButton>
          <RefreshCw className="h-4 w-4" />
          Refresh Analysis
        </LoadingButton>
      </form>
      <Stats topicId={topicId} />
    </div>
  );
}
