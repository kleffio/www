export function FeatureRow({
  icon: Icon,
  title,
  description
}: {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg p-2 transition hover:bg-white/5">
      <div className="mt-0.5 text-neutral-300">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <div className="text-sm font-medium text-neutral-100">{title}</div>
        <div className="text-[12px] text-neutral-400">{description}</div>
      </div>
    </div>
  );
}
