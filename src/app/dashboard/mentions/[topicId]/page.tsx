import {
  MentionsBreadcrumb,
  MentionsToolbar,
  MentionsTable,
} from "@/components/dashboard";

export default async function Page({
  params,
}: {
  params: Promise<{ topicId?: string }>;
}) {
  const { topicId } = await params;

  return (
    <>
      <MentionsBreadcrumb topicId={topicId} />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <MentionsToolbar topicId={topicId} />
        <MentionsTable topicId={topicId} />
      </div>
    </>
  );
}
