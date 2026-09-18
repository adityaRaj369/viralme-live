import { SHELL } from "@/lib/shell";
import { APP_NAME } from "@/lib/constants";

export const metadata = { title: "Privacy" };

export default function PrivacyPage() {
  return (
    <div className={`${SHELL} pb-16 pt-6`}>
      <h1 className="text-3xl font-extrabold tracking-tight">Privacy</h1>
      <div className="mt-6 space-y-4 text-[15px] leading-relaxed text-muted">
        <p>
          {APP_NAME} may collect basic usage analytics (page views, clicks) and account emails when
          you sign in. Demo mode stores leaderboard data in memory only.
        </p>
        <p>We do not sell personal data. Replace this page with a full privacy policy before launch.</p>
      </div>
    </div>
  );
}
