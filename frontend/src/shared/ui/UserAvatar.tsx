interface UserAvatarProps {
  initial: string;
  name?: string;
  email?: string;
  size?: "sm" | "md" | "lg";
  src?: string;
}

export function UserAvatar({ initial, name, email, size = "md", src }: UserAvatarProps) {
  const sizeClasses =
    size === "sm" ? "h-8 w-8 text-xs" : size === "lg" ? "h-16 w-16 text-2xl" : "h-10 w-10 text-sm";

  return (
    <div className="flex items-center gap-3">
      <div
        className={`bg-gradient-kleff relative flex shrink-0 items-center justify-center rounded-full font-semibold text-black ${sizeClasses} overflow-hidden shadow-[0_0_0_1px_rgba(0,0,0,0.7)] ring-1 ring-white/20`}
      >
        {src ? (
          <img
            src={src}
            alt={name || email || "User avatar"}
            className="h-full w-full object-cover"
          />
        ) : (
          initial
        )}
      </div>

      {(name || email) && (
        <div className="flex min-w-0 flex-col text-left">
          {name && <span className="truncate text-sm font-medium text-neutral-200">{name}</span>}
          {email && <span className="truncate text-xs text-neutral-400">{email}</span>}
        </div>
      )}
    </div>
  );
}
