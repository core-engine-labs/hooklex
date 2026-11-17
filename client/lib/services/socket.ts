/* eslint-disable @typescript-eslint/no-explicit-any */

import { io, Socket } from "socket.io-client";

type ConnectionStatus = "disconnected" | "connecting" | "connected";

type listenerType = "emit" | "on";

class WebSocketService {
  private socket: Socket | null = null;
  public connectionStatus: ConnectionStatus = "disconnected";
  private statusListeners: Set<(status: ConnectionStatus) => void> = new Set();
  private queuedListeners: Array<{
    event: string;
    callback: (...args: any[]) => void;
    type: listenerType;
  }> = [];

  private updateStatus(newStatus: ConnectionStatus) {
    this.connectionStatus = newStatus;
    this.statusListeners.forEach((listener) => listener(newStatus));
  }

  public onStatusChange(callback: (status: ConnectionStatus) => void) {
    this.statusListeners.add(callback);
    callback(this.connectionStatus);
    return () => {
      this.statusListeners.delete(callback);
    };
  }

  connect() {
    if (
      this.connectionStatus === "connected" ||
      this.connectionStatus === "connecting"
    ) {
      return;
    }

    this.updateStatus("connecting");

    this.socket = io(
      process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:5000",
      {
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      },
    );

    this.queuedListeners.forEach(({ event, callback, type }) => {
      if (type == "on") {
        this.socket?.on(event, callback);
      } else {
        this.socket?.emit(event, callback);
      }
    });
    this.queuedListeners = [];
    this.setupGlobalListeners();
  }

  private setupGlobalListeners() {
    if (!this.socket) return;

    this.socket.on("connect", () => {
      this.updateStatus("connected");
    });

    this.socket.on("disconnect", (reason) => {
      this.updateStatus("disconnected");
      if (reason === "io server disconnect") {
        this.socket = null;
      }
    });

    this.socket.on("connect_error", (error) => {
      console.error("[SocketService] Connection Error:", error.message);
      this.updateStatus("disconnected");
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.updateStatus("disconnected");
    }
  }

  emit(event: string, callback: (...args: any[]) => void) {
    if (!this.socket?.connected) {
      this.queuedListeners.push({ event, callback, type: "emit" });
      console.warn(
        `[SocketService] Attempted to emit "${event}" while socket is disconnected.`,
      );
    }
    this.socket?.emit(event, callback);
  }

  on(event: string, callback: (...args: any[]) => void) {
    if (!this.socket?.connected) {
      this.queuedListeners.push({ event, callback, type: "on" });
      console.warn(
        `[SocketService] Attempted to listen "${event}" while socket is disconnected.`,
      );
    }
    this.socket?.on(event, callback);
    return () => this.socket?.off(event, callback);
  }

  off(event: string, callback: (...args: any[]) => void) {
    if (!this.socket?.connected) {
      console.warn(
        `[SocketService] Attempted to emit "${event}" while socket is disconnected.`,
      );
    }
    this.socket?.off(event, callback);
  }
}

// Export singleton instance
export const socket = new WebSocketService();
