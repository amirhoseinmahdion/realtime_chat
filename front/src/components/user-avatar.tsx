interface UserAvatarProps {
  name: string;
  url?: string | null;
  size?: "small" | "medium" | "large";
}

export function UserAvatar({ name, size = "medium", url }: Readonly<UserAvatarProps>) {
  const sizeClass = size === "small" ? "size-9 text-xs" : size === "large" ? "size-24 text-xl" : "size-11 text-sm";
  return (
    <span
      aria-label={`${name} avatar`}
      className={`grid shrink-0 place-items-center overflow-hidden rounded-full bg-gradient-to-br from-teal-300/25 to-sky-400/15 bg-cover bg-center font-bold text-teal-200 ring-1 ring-white/10 ${sizeClass}`}
      role="img"
      style={url ? { backgroundImage: `url("${url}")` } : undefined}
    >
      {url ? <span className="sr-only">{name}</span> : initials(name)}
    </span>
  );
}

function initials(name: string): string {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "?";
}
