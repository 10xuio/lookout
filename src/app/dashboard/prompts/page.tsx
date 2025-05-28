import {
  PromptBreadcrumb,
  PromptToolbar,
  PromptsTable,
} from "@/components/dashboard";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ topicId?: string }>;
}) {
  const { topicId } = await searchParams;

  return (
    <>
      <PromptBreadcrumb topicId={topicId} />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <PromptToolbar topicId={topicId} />
        <PromptsTable topicId={topicId} />
      </div>
    </>
  );
}
