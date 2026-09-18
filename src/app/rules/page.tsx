import { SHELL } from "@/lib/shell";
import { APP_NAME } from "@/lib/constants";

export const metadata = { title: "Rules" };

export default function RulesPage() {
  return (
    <div className={`${SHELL} prose-sm pb-16 pt-6`}>
      <h1 className="text-3xl font-extrabold tracking-tight">Rules</h1>
      <ul className="mt-6 list-disc space-y-3 pl-5 text-[15px] text-muted">
        <li>Rank equals amount paid. Nothing else counts.</li>
        <li>Amounts are whole dollars (or your configured currency units).</li>
        <li>Claiming #1 requires current top + bump ($5 by default).</li>
        <li>All-time amounts never expire. Today amounts reset at UTC midnight.</li>
        <li>No fake products, malware, or illegal listings.</li>
        <li>We may remove listings that violate these rules without refund in demo mode.</li>
      </ul>
      <p className="mt-8 text-sm text-muted">{APP_NAME} public leaderboard rules.</p>
    </div>
  );
}
