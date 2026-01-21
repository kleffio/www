export function StatBadge({
  children,
  color = "white"
}: {
  children: React.ReactNode;
  color?: "white" | "green" | "amber" | "red";
}) {
  const colors = {
    white: "border-white/20 text-neutral-300",
    green: "border-emerald-400/20 text-emerald-300",
    amber: "border-amber-400/20 text-amber-200",
    red: "border-red-400/20 text-red-300"
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${colors[color]}`}
    >
      {children}
    </span>
  );
}
