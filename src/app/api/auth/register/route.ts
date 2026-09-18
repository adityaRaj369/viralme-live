import { NextRequest, NextResponse } from "next/server";
import { handleApiError } from "@/lib/errors";
import { rateLimit } from "@/lib/rate-limit";
import { DEMO_AUTH } from "@/lib/auth";
import { registerUser, registerSchema } from "@/modules/auth/service";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") ?? "anon";
    const limited = rateLimit(`register:${ip}`, 10, 60_000);
    if (!limited.success) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const body = await req.json();
    const data = registerSchema.parse(body);

    if (DEMO_AUTH) {
      return NextResponse.json({
        demo: true,
        id: `demo-${data.email.toLowerCase().replace(/[^a-z0-9]/g, "-").slice(0, 40)}`,
        email: data.email.toLowerCase(),
        profile: { username: data.username.toLowerCase(), displayName: data.name },
      });
    }

    const user = await registerUser(data);
    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
