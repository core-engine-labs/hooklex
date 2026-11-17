import { DocsLayout } from '@/layouts/notebook';
import { baseOptions } from '@/lib/layout.shared';
import { source } from '@/lib/source';
import type { ReactNode } from 'react';

export default function Layout({ children }: { children: ReactNode }) {
  const { nav, slots, ...base } = baseOptions();
  return (
    <DocsLayout
      {...base}
      nav={{ ...nav, mode: 'top' }}
      slots={slots}
      tree={source.getPageTree()}
      
    >
      {children}
    </DocsLayout>
  );
}

