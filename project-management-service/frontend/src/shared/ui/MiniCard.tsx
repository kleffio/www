export function MiniCard({
  title,
  description,
  children
}: {
  title: string;
  description?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="space-y-2 rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="text-sm font-semibold text-neutral-100">{title}</div>
      {description && (
        <div className="text-[12px] leading-snug text-neutral-400">{description}</div>
      )}
      {children}
    </div>
  );
}
