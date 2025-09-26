import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api-client';

interface FeedbackState {
  loading: boolean;
  error: string | null;
  info?: string | null;
  attemptsRemaining?: number | null;
  locked?: boolean;
  retryAfter?: number | null;
}

interface ExecuteOptions<T> {
  onSuccess?: (result: T) => void;
  successMessage?: string;
  transformError?: (err: any) => string;
}

export function useFormFeedback() {
  const [state, setState] = useState<FeedbackState>({ loading: false, error: null });

  const execute = useCallback(async <T,>(fn: () => Promise<T>, opts: ExecuteOptions<T> = {}) => {
    setState({ loading: true, error: null });
    try {
      const result = await fn();
      if (opts.successMessage) toast.success(opts.successMessage);
      opts.onSuccess?.(result);
      setState(prev => ({ ...prev, loading: false }));
      return result;
    } catch (error: any) {
      let message = 'Unexpected error';
      let attemptsRemaining: number | null = null;
      let retryAfter: number | null = null;
      let locked = false;

      if (error && typeof error === 'object') {
        if ('message' in error && typeof error.message === 'string') {
          message = error.message;
        }
        if ('status' in error) {
          if (error.status === 401) message = 'Invalid email or password.';
          if (error.status === 429) {
            message = 'Too many attempts. Please wait before trying again.';
            retryAfter = error.retryAfter || null;
            locked = true;
          }
          if (error.status >= 500) message = 'Server error. Please try again later.';
        }
      }

      // Parse rate limit headers for attempts remaining
      const rl = apiClient.getRateLimitInfo();
      if (rl?.remaining) {
        const remainNum = parseInt(rl.remaining, 10);
        if (!isNaN(remainNum)) attemptsRemaining = remainNum;
      }

      if (opts.transformError) message = opts.transformError(error);

      setState({ loading: false, error: message, attemptsRemaining, retryAfter, locked });
      toast.error(message + (attemptsRemaining != null ? ` (Attempts left: ${attemptsRemaining})` : ''));
      throw error; // rethrow if caller needs it
    }
  }, []);

  return { ...state, execute };
}
