"use client";

import { Plus, Search} from "lucide-react";
import { Button } from "@/components/ui/button";
import CollectionsSection from "./collection";
import { CreateCollectionDialog } from "./collection/create";
import CollectionSearchCard from "./collection/search";
import { useSearchRequests } from "@/hooks/useSearchRequests";


export default function Client() {
  const { isOpen, toggle, close } = useSearchRequests();

  return (
    <div className="flex flex-1 flex-col gap-6 overflow-hidden">
      {/* ── Action buttons — always pinned at top ── */}
      <div className="flex flex-col gap-2 shrink-0">
        <CreateCollectionDialog>
          <div className="flex w-full items-center gap-2 rounded-md bg-purple-700 text-white hover:bg-purple-700/90 px-4 py-2 text-sm font-medium  cursor-pointer">
            <Plus className="h-4 w-4" />
            Create Collection
          </div>
        </CreateCollectionDialog>

        <Button
          variant="outline"
          className="w-full justify-start gap-2"
          type="button"
          onClick={toggle}
        >
          <Search className="h-4 w-4 text-muted-foreground" />
          Search
        </Button>
      </div>
      {/*
       * ── CollectionSearchCard ────────────────────────────────────────
       * Always rendered here (above CollectionsSection) so it is
       * consistently at the top of the sidebar DOM order.
       * It renders null internally when isOpen === false,
       * so there is zero layout impact when closed.
       */}
      <CollectionSearchCard isOpen={isOpen} onClose={close} />

      {/* ── Collections list — always below the buttons ── */}
      {!isOpen && <CollectionsSection />}
    </div>
  );
}
