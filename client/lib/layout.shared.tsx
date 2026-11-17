import type { BaseLayoutProps } from '@/layouts/shared';

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: 'hooklex',
    },
    themeSwitch: {
      enabled: false,
    },
    searchToggle:{
      enabled:true
    }
  };
}
