'use client';
import type { ComponentProps } from 'react';
import { Search } from 'lucide-react';
import { useSearchContext } from 'fumadocs-ui/contexts/search';
import { useTranslations } from '@fuma-translate/react';
import type { VariantProps } from 'class-variance-authority';
import { cn } from '../../../lib/utils';
import { buttonVariants } from '../../../components/ui/button';

export interface SearchTriggerProps
  extends Omit<ComponentProps<'button'>, 'color'>,
    VariantProps<typeof buttonVariants> {
  color?: VariantProps<typeof buttonVariants>['variant'];
  hideIfDisabled?: boolean;
}

export function SearchTrigger({
  hideIfDisabled,
  size = 'icon-sm',
  color,
  variant = color ?? 'ghost',
  ...props
}: SearchTriggerProps) {
  const { setOpenSearch, enabled } = useSearchContext();
  const t = useTranslations({ note: 'search trigger' });
  if (hideIfDisabled && !enabled) return null;

  return (
    <button
      type="button"
      className={cn(
        buttonVariants({
          size,
          variant,
        }),
        props.className,
      )}
      data-search=""
      aria-label={t('Open Search', { note: 'aria-label' })}
      onClick={(e) => {
        props.onClick?.(e);
        setOpenSearch(true);
      }}
    >
      <Search />
    </button>
  );
}

export interface FullSearchTriggerProps extends ComponentProps<'button'> {
  hideIfDisabled?: boolean;
}

export function FullSearchTrigger({ hideIfDisabled, ...props }: FullSearchTriggerProps) {
  const { enabled, hotKey, setOpenSearch } = useSearchContext();
  const t = useTranslations({ note: 'search trigger' });
  if (hideIfDisabled && !enabled) return null;

  return (
    <button
      type="button"
      data-search-full=""
      {...props}
      className={cn(
        'inline-flex items-center gap-2 rounded-lg border bg-fd-secondary/50 p-1.5 ps-2 text-sm text-fd-muted-foreground transition-colors hover:bg-fd-accent hover:text-fd-accent-foreground',
        props.className,
      )}
      onClick={(e) => {
        props.onClick?.(e);
        setOpenSearch(true);
      }}
    >
      <Search className="size-4" />
      {t('Search')}
      <div className="ms-auto inline-flex gap-0.5">
        {hotKey?.map((k, i) => (
          <kbd key={i} className="rounded-md border bg-fd-background px-1.5">
            {k.display}
          </kbd>
        ))}
      </div>
    </button>
  );
}
