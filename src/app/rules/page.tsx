import { SHELL } from "@/lib/shell";
import { adminGetContent, adminGetSettings } from "@/lib/admin-demo";

export const metadata = { title: "Rules" };
export const dynamic = "force-dynamic";

export default function RulesPage() {
  const { rules } = adminGetContent();
  const siteName = String(adminGetSettings().siteName ?? "viralme.live");

  return (
    <div className={`${SHELL} prose-sm pb-16 pt-6`}>
      <h1 className="text-3xl font-extrabold tracking-tight">Rules</h1>
      <ul className="mt-6 list-disc space-y-3 pl-5 text-[15px] text-muted">
        {rules.map((r) => (
          <li key={r}>{r}</li>
        ))}
      </ul>
      <p className="mt-8 text-sm text-muted">{siteName} public leaderboard rules.</p>
    </div>
  );
}
