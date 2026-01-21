import { useState, useCallback } from "react";
import { getErrorMessage, logError } from "@app/error/utils/error-utils";

interface ErrorState {
  error: Error | null;
  message: string | null;
}

interface UseErrorHandlerReturn {
  error: Error | null;
  message: string | null;
  hasError: boolean;
  setError: (error: Error | string | null) => void;
  clearError: () => void;
  handleError: (error: unknown) => void;
}

export function useErrorHandler(): UseErrorHandlerReturn {
  const [errorState, setErrorState] = useState<ErrorState>({
    error: null,
    message: null
  });

  const setError = useCallback((error: Error | string | null) => {
    if (error === null) {
      setErrorState({ error: null, message: null });
      return;
    }

    const err = typeof error === "string" ? new Error(error) : error;
    const message = getErrorMessage(err);

    setErrorState({ error: err, message });
    logError(err);
  }, []);

  const clearError = useCallback(() => {
    setErrorState({ error: null, message: null });
  }, []);

  const handleError = useCallback(
    (error: unknown) => {
      const err = error instanceof Error ? error : new Error(String(error));
      setError(err);
    },
    [setError]
  );

  return {
    error: errorState.error,
    message: errorState.message,
    hasError: errorState.error !== null,
    setError,
    clearError,
    handleError
  };
}

export function useAsyncError<T>(asyncFn: () => Promise<T>, onSuccess?: (data: T) => void) {
  const [loading, setLoading] = useState(false);
  const { error, handleError, clearError } = useErrorHandler();

  const execute = useCallback(async () => {
    try {
      setLoading(true);
      clearError();
      const result = await asyncFn();
      onSuccess?.(result);
      return result;
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [asyncFn, onSuccess, handleError, clearError]);

  return {
    execute,
    loading,
    error,
    clearError
  };
}
