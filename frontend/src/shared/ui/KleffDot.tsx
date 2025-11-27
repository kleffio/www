type KleffDotProps = {
  size?: number;
  className?: string;
  variant?: "dot" | "full";
};

export function KleffDot({ size = 14, className = "", variant = "dot" }: KleffDotProps) {
  const src = variant === "full" ? "/KleffIconFull.png" : "/KleffIcon.png";

  return (
    <img
      src={src}
      width={size}
      height={size}
      alt="Kleff icon"
      className={`object-contain ${className}`}
    />
  );
}
