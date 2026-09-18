import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin-guard";
import { adminGetSettings, adminSetSettings } from "@/lib/admin-demo";

export async function GET() {
  const gate = await requireAdminSession("MODERATOR");
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });
  return NextResponse.json({ settings: adminGetSettings() });
}

export async function POST(req: NextRequest) {
  const gate = await requireAdminSession("ADMIN");
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });
  try {
    const body = await req.json();
    const settings = adminSetSettings(body.settings ?? body);
    return NextResponse.json({ settings });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Failed" }, { status: 400 });
  }
}
