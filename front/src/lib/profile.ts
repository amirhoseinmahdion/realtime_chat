import type { ProfileInput } from "@/providers/auth-provider";

const usernamePattern = /^[a-z0-9_]{3,30}$/;
const avatarTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const maxAvatarBytes = 500 * 1024;

export function validateAvatarFile(file: Pick<File, "size" | "type">): string | null {
  if (!avatarTypes.has(file.type)) return "Choose a PNG, JPG, WebP, or GIF image.";
  if (file.size > maxAvatarBytes) return "Avatar images must be smaller than 500 KB.";
  return null;
}

export function validateProfile(input: ProfileInput): string | null {
  if (!usernamePattern.test(input.username.trim().toLowerCase())) {
    return "Username must be 3-30 characters using letters, numbers, or underscores.";
  }
  if (!input.displayName.trim() || input.displayName.trim().length > 50) {
    return "Display name must be 1-50 characters.";
  }
  if (input.bio.trim().length > 160) return "Biography must be at most 160 characters.";
  if (input.avatarUrl) {
    if (input.avatarUrl.startsWith("data:")) {
      if (!/^data:image\/(png|jpeg|webp|gif);base64,[A-Za-z0-9+/]+={0,2}$/.test(input.avatarUrl) || input.avatarUrl.length > 684_000) {
        return "Avatar must be a valid PNG, JPG, WebP, or GIF smaller than 500 KB.";
      }
      return null;
    }
    try {
      const url = new URL(input.avatarUrl);
      if (!["http:", "https:"].includes(url.protocol)) throw new Error("Invalid protocol");
      if (input.avatarUrl.length > 500) return "Avatar URL must be at most 500 characters.";
    } catch {
      return "Avatar URL must be a valid HTTP or HTTPS URL.";
    }
  }
  return null;
}

export function isDeletionConfirmed(value: string): boolean {
  return value === "DELETE";
}
