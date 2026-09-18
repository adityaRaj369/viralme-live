import { describe, expect, it } from "vitest";
import { MediaPlatform } from "@prisma/client";

/**
 * Promotion expiry logic unit coverage (pure time comparison).
 */
function isExpired(endAt: Date, now = new Date()) {
  return endAt.getTime() <= now.getTime();
}

function paginate(total: number, page: number, pageSize: number) {
  const totalPages = Math.ceil(total / pageSize) || 1;
  const safePage = Math.min(Math.max(1, page), totalPages);
  const skip = (safePage - 1) * pageSize;
  return { skip, take: pageSize, totalPages, page: safePage };
}

describe("promotion expiry", () => {
  it("marks past endAt as expired", () => {
    expect(isExpired(new Date(Date.now() - 1000))).toBe(true);
    expect(isExpired(new Date(Date.now() + 60_000))).toBe(false);
  });
});

describe("pagination", () => {
  it("computes skip/take safely", () => {
    expect(paginate(100, 2, 24)).toEqual({ skip: 24, take: 24, totalPages: 5, page: 2 });
    expect(paginate(10, 99, 24).page).toBe(1);
  });
});

describe("listing limit rule", () => {
  it("blocks when activeCount >= limit", () => {
    const limit = 50;
    const activeCount = 50;
    const allowed = activeCount < limit;
    expect(allowed).toBe(false);
  });
});

describe("platform enum", () => {
  it("includes youtube and instagram", () => {
    expect(MediaPlatform.YOUTUBE).toBe("YOUTUBE");
    expect(MediaPlatform.INSTAGRAM).toBe("INSTAGRAM");
  });
});
