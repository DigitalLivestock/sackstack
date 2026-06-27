import { ChevronDown } from 'lucide-react';
import type { ReactNode } from 'react';
import { CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

type Props = {
  title: string;
  count?: number | string;
  action?: ReactNode;
  collapsible?: boolean;
  open?: boolean;
};

export function SectionHeader({ title, count, action, collapsible = true, open = true }: Props) {
  const heading = (
    <div className="flex min-w-0 items-center gap-2">
      {collapsible && (
        <ChevronDown
          className={cn(
            'h-4 w-4 shrink-0 text-muted-foreground transition-transform',
            !open && '-rotate-90',
          )}
          aria-hidden
        />
      )}
      <h2 className="truncate text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </h2>
      {count !== undefined && (
        <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium tabular-nums text-muted-foreground">
          {count}
        </span>
      )}
    </div>
  );

  return (
    <div className="flex h-9 items-center justify-between gap-2">
      {collapsible ? (
        <CollapsibleTrigger asChild>
          <button
            type="button"
            className="flex min-w-0 flex-1 items-center gap-2 rounded-md py-1 text-left hover:opacity-80"
            aria-label={`Toggle ${title}`}
          >
            {heading}
          </button>
        </CollapsibleTrigger>
      ) : (
        heading
      )}
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
