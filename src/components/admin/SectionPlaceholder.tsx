import { EmptyState } from "@/components/admin/EmptyState";
import { PageHeader } from "@/components/admin/PageHeader";

interface SectionPlaceholderProps {
  title: string;
  description: string;
}

export function SectionPlaceholder({
  title,
  description,
}: SectionPlaceholderProps) {
  return (
    <div className="mx-auto max-w-[92rem]">
      <PageHeader
        eyebrow="Owner workspace / Content"
        title={title}
        description={description}
      />
      <div className="mt-8">
        <EmptyState
          label="Module queued"
          title={`${title} management is the next implementation step.`}
          description="The protected route and responsive workspace are ready. CRUD controls will replace this state in its dedicated backlog item."
        />
      </div>
    </div>
  );
}
