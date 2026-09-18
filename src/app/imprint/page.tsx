import { SHELL } from "@/lib/shell";
import { adminGetContent } from "@/lib/admin-demo";

export const metadata = { title: "Imprint" };
export const dynamic = "force-dynamic";

export default function ImprintPage() {
  const { imprint } = adminGetContent();
  return (
    <div className={`${SHELL} pb-16 pt-6`}>
      <h1 className="text-3xl font-extrabold tracking-tight">Imprint</h1>
      <div className="mt-6 whitespace-pre-wrap text-[15px] leading-relaxed text-muted">{imprint}</div>
    </div>
  );
}
