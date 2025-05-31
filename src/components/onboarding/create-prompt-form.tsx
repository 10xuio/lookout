import { Textarea } from "@/components/ui/textarea";
import { SubmitButton } from "@/components/submit-button";
import { createPrompt } from "@/components/dashboard";

interface CreatePromptFormProps {
  topicId: string;
}

export function CreatePromptForm({ topicId }: CreatePromptFormProps) {
  async function handleSubmit(formData: FormData) {
    "use server";

    const content = formData.get("content") as string;

    if (!content?.trim()) return;

    await createPrompt({
      content: content.trim(),
      topicId,
      geoRegion: "global",
    });
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="content" className="text-sm font-medium">
          Create a Custom Prompt
        </label>
        <Textarea
          id="content"
          name="content"
          placeholder="e.g., Best accounting software for small business"
          required
          rows={3}
          className="resize-none mt-2"
        />
        <p className="text-xs text-muted-foreground">
          Enter a prompt you want to track for AI ranking performance
        </p>
      </div>
      <SubmitButton
        loadingText="Creating prompt..."
        buttonText="Create Prompt"
        icon="plus"
      />
    </form>
  );
}
