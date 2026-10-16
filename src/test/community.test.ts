import { describe, expect, it } from "vitest";
import { canModeratePost, validateCommunityFile, validateCommunityPost } from "@/lib/community";
describe("Community safeguards", () => {
  it("requires acceptance of good practices", () => { expect(validateCommunityPost("Arte", false)).not.toBeNull(); expect(validateCommunityPost("Arte", true)).toBeNull(); });
  it("rejects invalid titles", () => { expect(validateCommunityPost(" ", true)).not.toBeNull(); expect(validateCommunityPost("a".repeat(121), true)).not.toBeNull(); });
  it("restricts uploads to bitmap images", () => { expect(validateCommunityFile({ type: "image/svg+xml", size: 10 })).not.toBeNull(); expect(validateCommunityFile({ type: "image/png", size: 10 })).toBeNull(); });
  it("enforces a 10 MB file maximum", () => { expect(validateCommunityFile({ type: "image/png", size: 10 * 1024 * 1024 + 1 })).not.toBeNull(); });
  it("only permits owner or signed-in administrator moderation", () => { expect(canModeratePost("owner", "other", false)).toBe(false); expect(canModeratePost("owner", undefined, true)).toBe(false); expect(canModeratePost("owner", "owner", false)).toBe(true); expect(canModeratePost("owner", "admin", true)).toBe(true); });
});