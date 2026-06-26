import { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import type { Person } from '@/lib/bag-planner/types';
import { X, Pencil } from 'lucide-react';
import { Input } from '@/components/ui/input';

export function PersonChip({
  person,
  onEdit,
  onRemove,
  droppable,
  selected,
}: {
  person: Person;
  onEdit?: (patch: Partial<Person>) => void;
  onRemove?: () => void;
  droppable?: boolean;
  selected?: boolean;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `person:${person.id}`,
    data: { kind: 'person', personId: person.id },
    disabled: !droppable,
  });

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(person.name);

  const submit = () => {
    const trimmed = name.trim();
    if (trimmed && trimmed !== person.name && onEdit) {
      onEdit({ name: trimmed });
    }
    setEditing(false);
  };

  if (editing) {
    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5"
      >
        <Input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={submit}
          className="h-7 w-32 border-0 p-0 text-sm focus-visible:ring-0"
        />
      </form>
    );
  }

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
      <button
        onClick={() => onEdit && setEditing(true)}
        className="truncate font-medium hover:underline"
        title="Click to rename"
      >
        {person.name}
      </button>
      {onEdit ? (
        <button
          onClick={() => {
            setName(person.name);
            setEditing(true);
          }}
          className="text-muted-foreground hover:text-foreground"
          aria-label={`Edit ${person.name}`}
        >
          <Pencil className="h-3 w-3" />
        </button>
      ) : null}
      {onRemove ? (
        <button
          onClick={onRemove}
          className="text-muted-foreground hover:text-foreground"
          aria-label={`Remove ${person.name}`}
        >
          <X className="h-3.5 w-3.5" />
        </button>
      ) : null}
    </div>
  );
}
