import { redirect } from "next/navigation";

/** User dashboard removed (outbid.lol has none). Keep route tree for old links. */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  void children;
  redirect("/");
}
