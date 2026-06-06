import { useState, useCallback } from 'react';

/**
 * Hook to handle asynchronous errors and surface them to the nearest ErrorBoundary.
 * 
 * Usage:
 * const handleError = useErrorHandler();
 * 
 * try {
 *   await someAsyncAction();
 * } catch (error) {
 *   handleError(error);
 * }
 */
export function useErrorHandler() {
  const [error, setError] = useState<Error | null>(null);

  if (error) {
    // Throwing during render phase gets caught by the ErrorBoundary
    throw error;
  }

  const handleError = useCallback((err: unknown) => {
    if (err instanceof Error) {
      setError(err);
    } else if (typeof err === 'string') {
      setError(new Error(err));
    } else {
      setError(new Error('An unknown error occurred'));
    }
  }, []);

  return handleError;
}

export default useErrorHandler;
