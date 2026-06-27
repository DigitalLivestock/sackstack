import { useState, useRef, useEffect } from 'react';
import { Check, Plus, X } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { GLOBAL_TAGS } from '@/lib/bag-planner/types';

export function TagPicker({
  selected,
  customTags,
  onChange,
  onAddCustomTag,
  trigger,
}: {
  selected: string[];
  customTags: string[];
  onChange: (tags: string[]) => void;
  onAddCustomTag?: (tag: string) => void;
  trigger?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [newTag, setNewTag] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  const all = Array.from(new Set([...GLOBAL_TAGS, ...customTags]));

  const toggle = (tag: string) => {
    onChange(selected.includes(tag) ? selected.filter((t) => t !== tag) : [...selected, tag]);
  };

  const addTag = () => {
    const t = newTag.trim();
    if (!t) return;
    if (!selected.includes(t)) onChange([...selected, t]);
    if (onAddCustomTag && !all.includes(t)) onAddCustomTag(t);
    setNewTag('');
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {trigger ?? (
          <Button variant="outline" size="sm" className="h-7 text-xs">
            Tags ({selected.length})
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-64 p-2" align="start">
        <div className="mb-2 max-h-64 space-y-0.5 overflow-y-auto">
          {all.map((tag) => {
            const on = selected.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                onClick={() => toggle(tag)}
                className={`flex w-full items-center justify-between rounded px-2 py-1.5 text-left text-sm ${on ? 'bg-accent' : 'hover:bg-muted'}`}
              >
                <span>{tag}</span>
                {on ? <Check className="h-4 w-4" /> : null}
              </button>
            );
          })}
        </div>
        {onAddCustomTag ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              addTag();
            }}
            className="flex gap-1 border-t border-border pt-2"
          >
            <Input
              ref={inputRef}
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="New tag"
              className="h-8 text-sm"
            />
            <Button type="submit" size="sm" className="h-8 px-2">
              <Plus className="h-4 w-4" />
            </Button>
          </form>
        ) : null}
      </PopoverContent>
    </Popover>
  );
}

export function TagBadges({
  tags,
  onRemove,
}: {
  tags: string[];
  onRemove?: (tag: string) => void;
}) {
  if (!tags.length) return null;
  return (
    <div className="flex flex-wrap gap-1">
      {tags.map((t) => (
        <span
          key={t}
          className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground"
        >
          {t}
          {onRemove ? (
            <button
              type="button"
              onClick={() => onRemove(t)}
              className="hover:text-foreground"
              aria-label={`Remove ${t}`}
            >
              <X className="h-3 w-3" />
            </button>
          ) : null}
        </span>
      ))}
    </div>
  );
}
