import { NextRequest, NextResponse } from "next/server";
import { auth, DEMO_AUTH } from "@/lib/auth";
import {
  adminCreateCategory,
  adminListCategories,
  adminUpdateCategory,
} from "@/lib/admin-demo";

async function assertAdmin() {
  const session = await auth();
  if (!session?.user) return false;
  if (DEMO_AUTH && (session.user.role === "ADMIN" || session.user.email?.includes("admin@"))) {
    return true;
  }
  return session.user.role === "ADMIN" || session.user.role === "SUPER_ADMIN" || session.user.role === "MODERATOR";
}

export async function GET() {
  if (!(await assertAdmin())) {
    // Demo: still allow read so UI can load after admin login; otherwise empty
    const session = await auth();
    if (!session && !DEMO_AUTH) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }
  return NextResponse.json({ categories: adminListCategories() });
}

export async function POST(req: NextRequest) {
  if (!(await assertAdmin()) && !DEMO_AUTH) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const row = adminCreateCategory({
      name: String(body.name ?? ""),
      description: body.description ? String(body.description) : undefined,
    });
    return NextResponse.json(row, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Failed" }, { status: 400 });
  }
}

export async function PATCH(req: NextRequest) {
  if (!(await assertAdmin()) && !DEMO_AUTH) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
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
