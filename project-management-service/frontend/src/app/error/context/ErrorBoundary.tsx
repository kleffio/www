/* eslint-disable react-refresh/only-export-components */
import * as React from "react";
import { Button } from "@shared/ui/Button";
import { Badge } from "@shared/ui/Badge";
import { AlertTriangle, RefreshCcw } from "lucide-react";

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return <DefaultErrorFallback error={this.state.error} onReset={this.handleReset} />;
    }

    return this.props.children;
  }
}

interface DefaultErrorFallbackProps {
  error: Error | null;
  onReset: () => void;
}

function DefaultErrorFallback({ error, onReset }: DefaultErrorFallbackProps) {
  const isDevelopment = import.meta.env.DEV;

  return (
    <div className="flex min-h-[400px] items-center justify-center p-6">
      <div className="glass-panel w-full max-w-lg p-8">
        <div className="space-y-6 text-center">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
              <AlertTriangle className="h-8 w-8 text-red-400" />
            </div>
          </div>

          {/* Title and description */}
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2">
              <h2 className="text-xl font-semibold text-neutral-50">Something went wrong</h2>
              <Badge variant="destructive" className="text-xs">
                Component Error
              </Badge>
            </div>
            <p className="text-sm text-neutral-400">
              An error occurred while rendering this component.
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-left">
              <p className="text-xs font-semibold text-red-200">Error Message</p>
              <p className="mt-1 font-mono text-xs text-red-300">{error.message}</p>
            </div>
          )}

          {/* Stack trace (development only) */}
          {isDevelopment && error?.stack && (
            <details className="rounded-xl border border-white/10 bg-black/40 text-left">
              <summary className="cursor-pointer px-4 py-3 text-xs font-semibold text-neutral-400 hover:text-neutral-200">
                Stack Trace
              </summary>
              <div className="border-t border-white/10 px-4 py-3">
                <pre className="overflow-x-auto font-mono text-[10px] leading-relaxed text-neutral-500">
                  {error.stack}
                </pre>
              </div>
            </details>
          )}

          {/* Action button */}
          <Button
            onClick={onReset}
            className="bg-gradient-kleff w-full font-semibold text-black hover:brightness-110"
          >
            <RefreshCcw className="h-4 w-4" />
            Try Again
          </Button>
        </div>
      </div>
    </div>
  );
}
