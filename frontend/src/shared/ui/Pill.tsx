export function Pill({
  children,
  active = false
}: {
  children: React.ReactNode;
  active?: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition ${active ? "bg-white/10 text-white" : "text-neutral-400 hover:bg-white/5 hover:text-white"} `}
    >
      {children}
    </span>
  );
}
