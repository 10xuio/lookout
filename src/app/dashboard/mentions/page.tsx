import {
  MentionsBreadcrumb,
  MentionsToolbar,
  MentionsTable,
} from "@/components/dashboard";

export default async function Page() {
  return (
    <>
      <MentionsBreadcrumb />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <MentionsToolbar />
        <MentionsTable />
      </div>
    </>
  );
}
