import { useDroppable } from '@dnd-kit/core';
import type { Person } from '@/lib/bag-planner/types';
import { X } from 'lucide-react';

export function PersonChip({
  person,
  onRemove,
  droppable,
  selected,
}: {
  person: Person;
  onRemove?: () => void;
  droppable?: boolean;
  selected?: boolean;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `person:${person.id}`,
    data: { kind: 'person', personId: person.id },
    disabled: !droppable,
  });

  return (
    <div
      ref={droppable ? setNodeRef : undefined}
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-all ${
        isOver
          ? 'border-foreground bg-accent scale-105'
          : selected
            ? 'border-foreground bg-accent'
            : 'border-border bg-card'
      }`}
    >
      <span
        className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
        style={{ backgroundColor: person.color }}
      />
      <span className="truncate font-medium">{person.name}</span>
      {onRemove ? (
        <button
          onClick={onRemove}
          className="ml-1 text-muted-foreground hover:text-foreground"
          aria-label={`Remove ${person.name}`}
        >
          <X className="h-3.5 w-3.5" />
        </button>
      ) : null}
    </div>
  );
}
