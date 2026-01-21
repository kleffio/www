import { useEffect, useState } from "react";
import { useUptime } from "@features/observability/hooks/useUptime";
import { Activity } from "lucide-react";

interface UptimeCircleProps {
  size?: number;
  strokeWidth?: number;
  locale?: "en" | "fr";
}

export function UptimeCircle({ size = 140, strokeWidth = 10, locale = "en" }: UptimeCircleProps) {
  const { data, isLoading } = useUptime({ duration: "30d" });
  const [animatedPercentage, setAnimatedPercentage] = useState(0);

  const labels = {
    en: {
      uptime: "Uptime",
      period: "Last 30 days"
    },
    fr: {
      uptime: "Disponibilité",
      period: "30 derniers jours"
    }
  };

  const t = labels[locale];

  const uptimePercentage = data && data.uptimeHistory
    ? (() => {
        const recordedPoints = data.uptimeHistory.filter((p) => p.value >= 0);
        const operationalPoints = recordedPoints.filter((p) => p.value > 0);
        return recordedPoints.length > 0
          ? (operationalPoints.length / recordedPoints.length) * 100
          : 99.99;
      })()
    : 99.99;

  useEffect(() => {
    const duration = 1500;
    const startTime = Date.now();
    const startValue = 0;
    const endValue = uptimePercentage;

    const animate = () => {
      const currentTime = Date.now();
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = startValue + (endValue - startValue) * easeOut;

      setAnimatedPercentage(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    animate();
  }, [uptimePercentage]);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animatedPercentage / 100) * circumference;

  if (isLoading) {
    return (
      <div
        className="relative inline-flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        <div className="h-full w-full animate-pulse rounded-full border-8 border-neutral-700/20" />
      </div>
    );
  }

  return (
    <div className="relative inline-flex items-center justify-center">
      <div className="absolute inset-0 rounded-full bg-green-500/20 blur-2xl" />

      <svg width={size} height={size} className="relative z-10 -rotate-90 transform">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgb(64, 64, 64)"
          strokeWidth={strokeWidth}
          opacity={0.15}
        />

        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#uptimeGradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-500 ease-out"
        />

        <defs>
          <linearGradient id="uptimeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgb(34, 197, 94)" />
            <stop offset="50%" stopColor="rgb(16, 185, 129)" />
            <stop offset="100%" stopColor="rgb(5, 150, 105)" />
          </linearGradient>
        </defs>
      </svg>

      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center">
        <div className="mb-1 flex h-7 w-7 items-center justify-center rounded-full bg-green-500/10">
          <Activity className="h-4 w-4 text-green-400" />
        </div>
        <div className="text-3xl font-bold text-neutral-50">{animatedPercentage.toFixed(2)}%</div>
        <div className="text-[10px] font-medium tracking-wider text-neutral-400 uppercase">
          {t.uptime}
        </div>
        <div className="mt-0.5 text-[9px] text-neutral-500">{t.period}</div>
      </div>
    </div>
  );
}
