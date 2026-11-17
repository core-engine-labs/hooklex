"use client";

import { useConnectSocket } from "@/hooks/useConnectSocket";
import Image from "next/image";
import Link from "next/link";

type ConnectionStatus = "disconnected" | "connecting" | "connected";

const statusConfig: Record<ConnectionStatus, { color: string; label: string }> =
  {
    connected: { color: "bg-emerald-500", label: "Connected" },
    connecting: { color: "bg-amber-500 animate-pulse", label: "Connecting..." },
    disconnected: { color: "bg-rose-500", label: "Disconnected" },
  };

export function Header() {
  const { status } = useConnectSocket();
  const currentStatus = statusConfig[status] ?? statusConfig.disconnected;
  return (
    <div className="flex items-center gap-2 justify-between px-2 pt-1">
      <div className="flex items-center gap-2">
        <Link href="/">
          <Image src={"/logo.svg"} width={25} height={25} alt="logo" />
        </Link>
        <Link href="/">
          <h2 className="text-lg font-bold tracking-tight">hooklex</h2>
        </Link>
      </div>

      {/* Dynamic Connection Status Badge */}
      <div className="flex items-center gap-2 rounded-full border border-border bg-muted/50 px-2.5 py-1 text-xs font-medium">
        <span
          className={`h-2 w-2 rounded-full ${currentStatus.color}`}
          aria-hidden="true"
        />
        <span className="capitalize text-muted-foreground">
          {currentStatus.label}
        </span>
      </div>
    </div>
  );
}
