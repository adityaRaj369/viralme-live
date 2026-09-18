import { SHELL } from "@/lib/shell";
import { adminGetContent } from "@/lib/admin-demo";

export const metadata = { title: "Privacy" };
export const dynamic = "force-dynamic";

export default function PrivacyPage() {
  const { privacy } = adminGetContent();
  return (
    <div className={`${SHELL} pb-16 pt-6`}>
      <h1 className="text-3xl font-extrabold tracking-tight">Privacy</h1>
      <div className="mt-6 whitespace-pre-wrap text-[15px] leading-relaxed text-muted">{privacy}</div>
    </div>
  );
}
