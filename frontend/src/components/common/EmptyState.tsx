import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  actionTo?: string;
}

export default function EmptyState({ title, description, actionLabel, actionTo }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center rounded-[1.5rem] border border-dashed border-border bg-card/70 px-6 py-10 text-center shadow-soft">
      <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary text-foreground shadow-soft">
        <BookOpen className="h-6 w-6" aria-hidden="true" />
      </span>
      <h3 className="mt-5 text-xl font-black tracking-tight text-foreground">
        {title}
      </h3>
      <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
        {description}
      </p>
      {actionLabel && actionTo ? (
        <Link
          to={actionTo}
          className="mt-6 inline-flex items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-soft hover:shadow-float"
        >
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}