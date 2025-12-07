export type KleffDotVariant = "dot" | "full" | "black" | "black-full" | "white" | "white-full";

type KleffDotProps = {
  size?: number;
  className?: string;
  variant?: KleffDotVariant;
};

export function KleffDot({ size = 14, className = "", variant = "dot" }: KleffDotProps) {
  const sources: Record<KleffDotVariant, string> = {
    dot: "/KleffIcon.png",
    full: "/KleffIconFull.png",
    black: "/KleffIconBlack.png",
    "black-full": "/KleffIconBlackFull.png",
    white: "/KleffIconWhite.png",
    "white-full": "/KleffIconWhiteFull.png"
  };

  return (
    <img
      src={sources[variant]}
      width={size}
      height={size}
      alt="Kleff icon"
      className={`object-contain ${className}`}
    />
  );
}
