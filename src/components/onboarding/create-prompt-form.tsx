"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { SubmitButton } from "@/components/submit-button";
import { createPrompt } from "@/components/dashboard/rankings/actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface CreatePromptFormProps {
  topicId: string;
}

export function CreatePromptForm({ topicId }: CreatePromptFormProps) {
  const [content, setContent] = useState("");
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    const content = formData.get("content") as string;

    if (!content?.trim()) {
      toast.error("Please enter a prompt");
      return;
    }

    const result = await createPrompt({
      content: content.trim(),
      topicId,
      geoRegion: "global",
    });

    if (result.success) {
      toast.success("Prompt created successfully!");
      router.refresh();
    } else {
      toast.error(result.error || "Failed to create prompt");
    }
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="content" className="text-sm font-medium">
          Prompt Content
        </label>
        <Textarea
          id="content"
          name="content"
          placeholder="e.g., best accounting software for small business"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          rows={3}
          className="resize-none"
        />
        <p className="text-xs text-muted-foreground">
          Enter a search query you want to track for SEO performance
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
