'use client';

import { Layers } from 'lucide-react';
import { Virtuoso } from 'react-virtuoso';
import { Skeleton } from '@/components/ui/skeleton';
import { useCollections } from '@/hooks/useCollections';
import { CollectionItem } from './Item';
import { useRegListners } from '@/hooks/useRegListners';



export default function CollectionsSection() {
  const { collections, loading, hasMore, loadMore, initialLoading } = useCollections(10);
  // register listners
  useRegListners();

  if (initialLoading) {
    return (
      <div className="flex flex-col gap-1 shrink-0">
        <div className="flex items-center gap-2 px-2">
          <Layers className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Collections
          </span>
        </div>
        <nav className="flex flex-col gap-1 pt-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2 py-1.5 px-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-5 w-24 ml-auto" />
            </div>
          ))}
        </nav>
      </div>
    );
  }

  if (collections.length === 0 && !initialLoading) {
    return (
      <div className="flex flex-col gap-1 shrink-0">
        <div className="flex items-center gap-2 px-2">
          <Layers className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Collections
          </span>
        </div>
        <div className="text-sm text-muted-foreground px-2 py-4 text-center">
          No collections found
        </div>
      </div>
    );
  }

  return (
    // flex-1 min-h-0: fills remaining sidebar height while respecting the flex chain
    <div className="flex flex-1 flex-col gap-1 min-h-0">
      <div className="flex items-center gap-2 px-2 shrink-0">
        <Layers className="h-4 w-4 text-muted-foreground" />
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Collections
        </span>
      </div>

      {/* min-h-0 + flex-1 lets Virtuoso measure its own height from the flex parent */}
      <div id='content-sidbar' className="flex-1 min-h-0 mt-4">
        <Virtuoso
          style={{ height: '100%' }}
          data={collections}
          itemContent={(index, collection) => (
            <CollectionItem
              key={collection.id}
              collection={collection}
              index={index}
              totalCollections={collections.length}
            />
          )}
          endReached={() => {
            if (hasMore && !loading) {
              loadMore();
            }
          }}
          overscan={200}
          components={{
            Footer: () =>
              loading ? (
                <div className="flex flex-col gap-1 py-1 px-2">
                  <Skeleton className="h-7 w-full" />
                  <Skeleton className="h-7 w-full" />
                </div>
              ) : null,
          }}
        />
      </div>
    </div>
  );
}