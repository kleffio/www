import { memo } from "react";
import { Button } from "@shared/ui/Button";

interface AuthButtonsProps {
  onLogin: () => void;
  variant?: "desktop" | "mobile";
}

export const AuthButtons = memo(({ onLogin, variant = "desktop" }: AuthButtonsProps) => {
  if (variant === "mobile") {
    return (
      <>
        <Button
          onClick={onLogin}
          variant="ghost"
          size="sm"
          className="text-muted hover:text-foreground hidden text-[11px] font-medium sm:inline-flex"
        >
          Sign in
        </Button>
        <Button
          onClick={onLogin}
          size="sm"
          className="bg-gradient-kleff hidden text-[11px] font-semibold text-black shadow-md shadow-black/40 hover:brightness-110 sm:inline-flex"
        >
          Start
        </Button>
      </>
    );
  }

  return (
    <>
      <Button
        onClick={onLogin}
        variant="outline"
        size="sm"
        className="border-white/18 bg-transparent text-[11px] font-medium hover:border-white/40 hover:bg-white/5"
      >
        Sign in
      </Button>
      <Button
        onClick={onLogin}
        size="sm"
        className="bg-gradient-kleff text-[11px] font-semibold text-black shadow-md shadow-black/40 hover:brightness-110"
      >
        Start your project
      </Button>
    </>
  );
});

AuthButtons.displayName = "AuthButtons";
