import { describe, expect, it } from "vitest";

import { isDeletionConfirmed, validateProfile } from "./profile";

const validProfile = {
  username: "alex_01",
  displayName: "Alex",
  bio: "Ready to chat",
  avatarUrl: "https://example.com/avatar.png",
};

describe("profile validation", () => {
  it("accepts valid editable profile fields", () => {
    expect(validateProfile(validProfile)).toBeNull();
  });

  it("rejects invalid usernames, empty names, long bios, and unsafe avatar URLs", () => {
    expect(validateProfile({ ...validProfile, username: "A!" })).toContain("Username");
    expect(validateProfile({ ...validProfile, displayName: "" })).toContain("Display name");
    expect(validateProfile({ ...validProfile, bio: "x".repeat(161) })).toContain("Biography");
    expect(validateProfile({ ...validProfile, avatarUrl: "javascript:alert(1)" })).toContain("Avatar URL");
  });

  it("requires the exact destructive confirmation phrase", () => {
    expect(isDeletionConfirmed("delete")).toBe(false);
    expect(isDeletionConfirmed("DELETE")).toBe(true);
  });
});
