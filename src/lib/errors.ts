import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { AuthError } from "@/lib/rbac";

export class AppError extends Error {
  status: number;
  code?: string;
  details?: unknown;

  constructor(message: string, status = 400, code?: string, details?: unknown) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
    this.name = "AppError";
  }
}

export function handleApiError(error: unknown) {
  if (error instanceof AuthError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  if (error instanceof AppError) {
    return NextResponse.json(
      { error: error.message, code: error.code, details: error.details },
      { status: error.status },
    );
  }
  if (error instanceof ZodError) {
    return NextResponse.json(
      { error: "Validation failed", details: error.flatten() },
      { status: 400 },
    );
  }
  console.error(error);
  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}
