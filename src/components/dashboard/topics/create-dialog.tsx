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
import { createTopicFromUrl } from "./actions";
import { SubmitButton } from "@/components/submit-button";

interface CreateTopicDialogProps {
  children: React.ReactNode;
}

export function CreateTopicDialog({ children }: CreateTopicDialogProps) {
  async function handleCreateTopic(formData: FormData) {
    "use server";

    const url = formData.get("url") as string;

    if (!url?.trim()) {
      return;
    }

    await createTopicFromUrl({ url: url.trim() });
  }

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form action={handleCreateTopic}>
          <DialogHeader>
            <DialogTitle>Add New Topic</DialogTitle>
            <DialogDescription>
              Enter a website URL to automatically create a topic with extracted
              information.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="url" className="text-sm font-medium">
                Website URL
              </label>
              <Input
                id="url"
                name="url"
                type="url"
                placeholder="https://google.com"
                required
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <SubmitButton
              loadingText="Creating..."
              buttonText="Create Topic"
              icon="plus"
            />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
