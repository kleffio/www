export function SoftPanel({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/30 p-4 backdrop-blur-sm">
      {children}
    </div>
  );
}
