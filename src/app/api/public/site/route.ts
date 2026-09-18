import { NextResponse } from "next/server";
import { adminGetContent, adminGetSettings } from "@/lib/admin-demo";

/** Public read-only site bits for client chrome (footer). No secrets. */
export async function GET() {
  const s = adminGetSettings();
  const c = adminGetContent();
  return NextResponse.json({
    siteName: s.siteName,
    footerBlurb: c.footerBlurb,
  });
}
