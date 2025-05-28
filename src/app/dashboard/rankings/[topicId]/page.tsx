import {
  PromptBreadcrumb,
  PromptToolbar,
  PromptsTable,
} from "@/components/dashboard";

export default async function Page({
  params,
}: {
  params: Promise<{ topicId: string }>;
}) {
  const { topicId } = await params;

  return (
    <>
      <PromptBreadcrumb topicId={topicId} page="rankings" />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <PromptToolbar topicId={topicId} />
        <PromptsTable topicId={topicId} />
      </div>
    </>
  );
}
