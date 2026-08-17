import { describe, expect, it } from "vitest";

import { translate, translateAuthError } from "./language-provider";

describe("authentication translations", () => {
  it("translates client-side validation errors into Persian", () => {
    expect(translate("Use 3–30 letters, numbers, or underscores.", "fa")).toBe(
      "از ۳ تا ۳۰ حرف انگلیسی، عدد یا زیرخط استفاده کنید.",
    );
    expect(translate("Password must be between 8 and 72 characters.", "fa")).toBe(
      "رمز عبور باید بین ۸ تا ۷۲ نویسه باشد.",
    );
  });

  it("translates authentication API errors into Persian", () => {
    expect(translate("Invalid username or password", "fa")).toBe("نام کاربری یا رمز عبور نادرست است.");
    expect(translate("Username is already in use", "fa")).toBe("این نام کاربری قبلاً استفاده شده است.");
  });

  it("keeps English text in English mode and safely falls back for unknown text", () => {
    expect(translate("Invalid username or password", "en")).toBe("Invalid username or password");
    expect(translate("Unknown error", "fa")).toBe("Unknown error");
  });

  it("never exposes an unknown English authentication error in Persian mode", () => {
    expect(translateAuthError("An unfamiliar server error", "fa")).toBe("مشکلی پیش آمد. دوباره تلاش کنید.");
    expect(translateAuthError("An unfamiliar server error", "en")).toBe("An unfamiliar server error");
  });
});
