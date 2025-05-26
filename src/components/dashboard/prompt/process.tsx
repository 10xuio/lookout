import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { processPrompt } from "./actions";
import { ProcessSubmitButton } from "./process-button";

interface ProcessButtonProps {
  promptId: string;
  status: string;
}

export function ProcessButton({ promptId, status }: ProcessButtonProps) {
  if (status === "completed") {
    return (
      <Button variant="outline" size="sm" disabled>
        Completed
      </Button>
    );
  }

  if (status === "processing") {
    return (
      <Button variant="outline" size="sm" disabled>
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
        Processing
      </Button>
    );
  }

  async function handleProcess() {
    "use server";
    await processPrompt(promptId);
  }

  if (status === "failed") {
    return (
      <form action={handleProcess}>
        <ProcessSubmitButton variant="retry" />
      </form>
    );
  }

  return (
    <form action={handleProcess}>
      <ProcessSubmitButton variant="process" />
    </form>
  );
}
