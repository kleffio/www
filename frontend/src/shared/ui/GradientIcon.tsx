export function GradientIcon({
  icon: Icon
}: {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}) {
  return (
    <div className="bg-gradient-kleff flex h-6 w-6 items-center justify-center rounded-md shadow-sm">
      <Icon className="h-3.5 w-3.5 text-black" />
    </div>
  );
}
