import { SHELL } from "@/lib/shell";
import { APP_NAME } from "@/lib/constants";

export const metadata = { title: "Terms" };

export default function TermsPage() {
  return (
    <div className={`${SHELL} pb-16 pt-6`}>
      <h1 className="text-3xl font-extrabold tracking-tight">Terms</h1>
      <div className="mt-6 space-y-4 text-[15px] leading-relaxed text-muted">
        <p>
          By using {APP_NAME} you agree that ranking placements are promotional purchases, not
          investments. Demo mode uses simulated payments.
        </p>
        <p>
          You are responsible for the accuracy of URLs and claims on your listings. We may remove
          content that is illegal, harmful, or misleading.
        </p>
        <p>These terms are a placeholder for a production launch — replace with counsel-reviewed copy.</p>
      </div>
    </div>
  );
}
