"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/submit-button";
import { createTopicFromUrl } from "@/components/dashboard/topics/actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Globe } from "lucide-react";

export function TopicStep() {
  const [url, setUrl] = useState("");
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    const url = formData.get("url") as string;

    if (!url?.trim()) {
      toast.error("Please enter a website URL");
      return;
    }

    const result = await createTopicFromUrl({ url: url.trim() });

    if (result.success) {
      toast.success("Topic created successfully!");
      router.refresh();
    } else {
      toast.error(result.error || "Failed to create topic");
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <Globe className="h-6 w-6 text-primary" />
        </div>
        <h2 className="text-2xl font-semibold">Add Your Website</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          Enter your website URL and we&apos;ll automatically extract
          information to create a topic for tracking
        </p>
      </div>

      <form action={handleSubmit} className="space-y-4 max-w-md mx-auto">
        <div className="space-y-2">
          <label htmlFor="url" className="text-sm font-medium">
            Website URL
          </label>
          <Input
            id="url"
            name="url"
            type="url"
            placeholder="https://example.com or example.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
            className="h-12"
          />
          <p className="text-xs text-muted-foreground">
            We&apos;ll use this to understand your brand and competitive
            landscape
          </p>
        </div>

        <SubmitButton
          loadingText="Creating topic..."
          buttonText="Continue"
          icon="check"
        />
      </form>
    </div>
  );
}
