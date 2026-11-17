"use client";

import { useState, ReactNode } from "react";
import { Menu, X } from "lucide-react";

interface MobileSidebarProps {
  header: ReactNode;
  children: ReactNode;
}

export function MobileSidebar({ header, children }: MobileSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Top Bar */}
      <nav className="flex items-center justify-between border-b border-border bg-sidebar p-3 md:hidden">
        {header}
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle Sidebar"
          className="rounded-md p-2 text-sidebar-foreground hover:bg-accent focus:outline-none"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 transition-opacity"
            onClick={() => setIsOpen(false)}
          />

          {/* Slide-over Container */}
          <aside className="relative z-10 flex h-full w-[85%] max-w-[360px] flex-col border-r border-border bg-sidebar text-sidebar-foreground shadow-xl">
            {children}
          </aside>
        </div>
      )}
    </>
  );
}
