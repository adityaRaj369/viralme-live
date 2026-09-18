import { SiteContentForm } from "@/features/admin/site-content-form";

export const dynamic = "force-dynamic";

export default function AdminContentPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold">Site content</h1>
      <p className="mt-2 text-sm text-muted">
        Edit About, FAQ, Rules, Terms, Privacy, Imprint, and footer copy. Changes apply to the
        public site immediately (session memory until Postgres is connected).
      </p>
      <SiteContentForm />
    </div>
  );
}
