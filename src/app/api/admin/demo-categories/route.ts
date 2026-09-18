import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin-guard";
import {
  adminCreateCategory,
  adminListCategories,
  adminUpdateCategory,
} from "@/lib/admin-demo";

export async function GET() {
  const gate = await requireAdminSession("MODERATOR");
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });
  return NextResponse.json({ categories: adminListCategories() });
}

export async function POST(req: NextRequest) {
  const gate = await requireAdminSession("ADMIN");
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });
  try {
    const body = await req.json();
    const row = adminCreateCategory({
      name: String(body.name ?? ""),
      shortName: body.shortName ? String(body.shortName) : undefined,
      description: body.description ? String(body.description) : undefined,
      icon: body.icon ? String(body.icon) : undefined,
    });
    return NextResponse.json(row, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Failed" }, { status: 400 });
  }
}

export async function PATCH(req: NextRequest) {
  const gate = await requireAdminSession("ADMIN");
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });
  try {
    const body = await req.json();
    const row = adminUpdateCategory(String(body.id), {
      name: body.name,
      description: body.description,
      status: body.status,
      sortOrder: body.sortOrder,
      icon: body.icon,
    });
    return NextResponse.json(row);
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Failed" }, { status: 400 });
  }
}
