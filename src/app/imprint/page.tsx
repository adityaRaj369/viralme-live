import { SHELL } from "@/lib/shell";
import { APP_NAME } from "@/lib/constants";

export const metadata = { title: "Imprint" };

export default function ImprintPage() {
  return (
    <div className={`${SHELL} pb-16 pt-6`}>
      <h1 className="text-3xl font-extrabold tracking-tight">Imprint</h1>
      <div className="mt-6 space-y-2 text-[15px] text-muted">
        <p>{APP_NAME}</p>
        <p>Demo project — not a registered company imprint yet.</p>
        <p>Contact: hello@viralme.live</p>
      </div>
    </div>
  );
}
