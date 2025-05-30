import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/submit-button";
import { createTopicFromUrl } from "@/components/dashboard/topics/actions";
import { Tag } from "lucide-react";

interface TopicStepProps {
  isComplete?: boolean;
}

export function TopicStep({ isComplete = false }: TopicStepProps) {
  async function handleSubmit(formData: FormData) {
    "use server";

    const url = formData.get("url") as string;

    if (!url?.trim()) return;

    await createTopicFromUrl({ url: url.trim() });
  }

  if (isComplete) {
    return (
      <div className="text-center space-y-1">
        <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <Tag className="h-6 w-6 text-primary" />
        </div>
        <h2 className="text-xl font-semibold">Topic Added</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          Your website has been successfully added and analyzed
        </p>
      </div>
    );
  }

  return (
    <form action={handleSubmit} className="space-y-4 max-w-md">
      <div className="space-y-2">
        <label htmlFor="url" className="text-sm font-medium">
          Website URL
        </label>
        <Input
          id="url"
          name="url"
          type="url"
          placeholder="https://google.com"
          required
          className="h-12"
        />
        <p className="text-xs text-muted-foreground">
          We&apos;ll use this to understand your brand and competitive landscape
        </p>
      </div>

      <SubmitButton
        loadingText="Creating topic..."
        buttonText="Continue"
        icon="check"
      />
    </form>
  );
}
