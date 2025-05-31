import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/submit-button";
import { createTopicFromUrl } from "@/components/dashboard";

export function TopicStep() {
  async function handleSubmit(formData: FormData) {
    "use server";

    const url = formData.get("url") as string;

    if (!url?.trim()) return;

    await createTopicFromUrl({ url: url.trim() });
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
          className="h-12 mt-2"
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
