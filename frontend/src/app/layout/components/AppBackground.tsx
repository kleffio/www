export function AppBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10">
      <div className="bg-modern-noise bg-kleff-spotlight h-full w-full opacity-60" />
      <div className="bg-kleff-grid absolute inset-0 opacity-[0.25]" />
      <div className="absolute inset-x-0 top-0 h-40 bg-linear-to-b from-white/10 via-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-linear-to-t from-black via-transparent" />
    </div>
  );
}
