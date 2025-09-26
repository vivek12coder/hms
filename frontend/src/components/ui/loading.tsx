'use client';

import { Loader2 } from 'lucide-react';

interface LoadingProps {
  size?: 'small' | 'medium' | 'large';
  fullScreen?: boolean;
  text?: string;
}

export function LoadingSpinner({ size = 'medium', fullScreen = false, text }: LoadingProps) {
  const sizeClass = {
    small: 'h-4 w-4',
    medium: 'h-8 w-8',
    large: 'h-12 w-12',
  };

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm z-50">
        <Loader2 className={`${sizeClass[size]} text-primary animate-spin`} />
        {text && <p className="mt-4 text-muted-foreground text-sm">{text}</p>}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-4">
      <Loader2 className={`${sizeClass[size]} text-primary animate-spin`} />
      {text && <p className="mt-2 text-muted-foreground text-sm">{text}</p>}
    </div>
  );
}

interface LoadingOverlayProps {
  isLoading: boolean;
  children: React.ReactNode;
  text?: string;
  size?: 'small' | 'medium' | 'large';
}

export function LoadingOverlay({ isLoading, children, text, size = 'medium' }: LoadingOverlayProps) {
  return (
    <div className="relative">
      {children}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-[1px] rounded-md z-10">
          <LoadingSpinner size={size} text={text} />
        </div>
      )}
    </div>
  );
}

export function LoadingSection() {
  return (
    <div className="flex items-center justify-center min-h-[100px]">
      <Loader2 className="h-8 w-8 text-primary animate-spin" />
    </div>
  );
}

export function LoadingButton({
  loading,
  children,
  disabled,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { loading: boolean }) {
  return (
    <button disabled={loading || disabled} {...props}>
      {loading ? (
        <span className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading...
        </span>
      ) : (
        children
      )}
    </button>
  );
}