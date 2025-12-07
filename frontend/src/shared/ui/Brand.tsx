import { Link } from "react-router-dom";
import { KleffDot } from "@shared/ui/KleffDot";
import { ROUTES } from "@app/routes/routes";

interface BrandProps {
  size?: number;
  fontSize?: string;
  onClick?: () => void;
}

export function Brand({ size = 22, fontSize = "text-[13px]", onClick }: BrandProps) {
  return (
    <Link to={ROUTES.HOME} onClick={onClick} className="flex items-center gap-2">
      <KleffDot variant="full" size={size} />
      <span className={`${fontSize} font-semibold tracking-[0.32em] text-neutral-100 uppercase`}>
        LEFF
      </span>
    </Link>
  );
}
