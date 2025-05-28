import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { createPrompt } from "./actions";
import { getTopics } from "../topics/actions";
import { SubmitButton } from "./submit-button";
import { Region } from "@/types/prompt";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface CreatePromptDialogProps {
  children: React.ReactNode;
}

async function TopicSelect() {
  const topics = await getTopics();

  return (
    <div className="grid gap-2">
      <label htmlFor="topicId" className="text-sm font-medium">
        Topic
      </label>
      <Select name="topicId">
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Topic" />
        </SelectTrigger>
        <SelectContent>
          {topics.map((topic) => (
            <SelectItem key={topic.id} value={topic.id}>
              {topic.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export function CreatePromptDialog({ children }: CreatePromptDialogProps) {
  async function handleCreatePrompt(formData: FormData) {
    "use server";

    const content = formData.get("content") as string;
    const topicId = formData.get("topicId") as string;
    const geoRegion = formData.get("geoRegion") as string;
    const tags = formData.get("tags") as string;

    if (!content?.trim() || !topicId?.trim()) {
      console.error("Missing required fields");
      return;
    }

    await createPrompt({
      content: content.trim(),
      topicId: topicId.trim(),
      geoRegion: (geoRegion as Region) ?? "global",
      tags,
    });
  }

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <form action={handleCreatePrompt}>
          <DialogHeader>
            <DialogTitle>Create New Prompt</DialogTitle>
            <DialogDescription>
              Create a new SEO prompt to analyze search results and rankings.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="content" className="text-sm font-medium">
                Prompt Content
              </label>
              <Textarea
                id="content"
                name="content"
                placeholder="Enter your prompt content..."
                required
                autoFocus
                rows={4}
              />
            </div>

            <Suspense fallback={<Skeleton className="w-full h-10" />}>
              <TopicSelect />
            </Suspense>

            <div className="grid gap-2">
              <label htmlFor="geoRegion" className="text-sm font-medium">
                Geographic Region
              </label>
              <Select name="geoRegion">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="global">Global</SelectItem>
                  <SelectItem value="us">United States</SelectItem>
                  <SelectItem value="eu">Europe</SelectItem>
                  <SelectItem value="uk">United Kingdom</SelectItem>
                  <SelectItem value="de">Germany</SelectItem>
                  <SelectItem value="fr">France</SelectItem>
                  <SelectItem value="es">Spain</SelectItem>
                  <SelectItem value="it">Italy</SelectItem>
                  <SelectItem value="in">India</SelectItem>
                  <SelectItem value="jp">Japan</SelectItem>
                  <SelectItem value="cn">China</SelectItem>
                  <SelectItem value="au">Australia</SelectItem>
                  <SelectItem value="ca">Canada</SelectItem>
                  <SelectItem value="br">Brazil</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <label htmlFor="tags" className="text-sm font-medium">
                Tags (optional)
              </label>
              <Input
                id="tags"
                name="tags"
                placeholder="Enter tags separated by commas"
              />
            </div>
          </div>
          <DialogFooter>
            <SubmitButton />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
