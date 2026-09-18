import { describe, expect, it } from "vitest";
import { parseExternalUrl, parseYouTubeUrl, parseInstagramUrl } from "@/modules/media/adapters";
import { hasMinRole } from "@/lib/roles";
import { slugify, formatNumber } from "@/lib/utils";
import { mockPaymentProvider } from "@/modules/payments/mock";
import { computeOrganicScore } from "@/modules/ranking/organic";
import { assertNoEngagementPlacement } from "@/modules/discovery/policy";

describe("placement policy", () => {
  it("blocks engagement-based organic scoring", () => {
    expect(() => computeOrganicScore()).toThrow(/Engagement ranking is disabled/);
  });

  it("asserts discovery is not engagement placement", () => {
    expect(assertNoEngagementPlacement()).toBe(true);
  });
});

describe("media adapters", () => {
  it("parses YouTube watch and shorts URLs", () => {
    const watch = parseYouTubeUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
    expect(watch?.externalId).toBe("dQw4w9WgXcQ");
    expect(watch?.platform).toBe("YOUTUBE");
    const shorts = parseYouTubeUrl("https://www.youtube.com/shorts/abc123XYZ00");
    expect(shorts?.platform).toBe("YOUTUBE_SHORTS");
  });

  it("parses Instagram reel URLs", () => {
    const reel = parseInstagramUrl("https://www.instagram.com/reel/CxYz123AbCd/");
    expect(reel?.platform).toBe("INSTAGRAM");
    expect(reel?.externalId).toBe("CxYz123AbCd");
  });

  it("falls back to external for product URLs", () => {
    const parsed = parseExternalUrl("https://shop.example.com/p/shoes");
    expect(parsed?.platform).toBe("EXTERNAL");
  });
});

describe("rbac", () => {
  it("ranks roles correctly", () => {
    expect(hasMinRole("ADMIN", "MODERATOR")).toBe(true);
    expect(hasMinRole("USER", "ADMIN")).toBe(false);
    expect(hasMinRole("SUPER_ADMIN", "ADMIN")).toBe(true);
  });
});

describe("utils", () => {
  it("slugifies titles", () => {
    expect(slugify("Nike Air Max!")).toBe("nike-air-max");
  });
  it("formats compact numbers", () => {
    expect(formatNumber(1200)).toBe("1.2K");
  });
});

describe("mock payment provider", () => {
  it("creates and verifies orders server-side", async () => {
    const order = await mockPaymentProvider.createOrder({
      amount: 999,
      currency: "INR",
      receipt: "test-receipt",
    });
    expect(order.providerOrderId).toMatch(/^mock_order_/);
    const verified = await mockPaymentProvider.verifyPayment({
      providerOrderId: order.providerOrderId,
      providerPaymentId: "mock_pay_1",
      signature: "mock_valid_signature",
    });
    expect(verified.valid).toBe(true);
    expect(verified.status).toBe("SUCCEEDED");
    expect(verified.amount).toBe(999);
  });

  it("rejects invalid webhook signatures", () => {
    expect(mockPaymentProvider.verifyWebhookSignature("{}", "bad")).toBe(false);
    expect(mockPaymentProvider.verifyWebhookSignature("{}", "mock_valid_signature")).toBe(true);
  });
});
