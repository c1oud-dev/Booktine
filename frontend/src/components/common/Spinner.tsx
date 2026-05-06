import { cn } from '@/lib/utils';

interface SpinnerProps {
  label?: string;
  className?: string;
}

export default function Spinner({ label = '불러오는 중...', className }: SpinnerProps) {
  return (
    <div
      className={cn('inline-flex items-center gap-3 text-sm font-semibold text-muted-foreground', className)}
      role="status"
      aria-live="polite"
    >
      <span
        className="h-5 w-5 animate-spin rounded-full border-2 border-primary/20 border-t-primary"
        aria-hidden="true"
      />
      <span>{label}</span>
    </div>
  );
}