/**
 * useWebSocket — connects to EvalAI backend WebSocket for real-time batch updates.
 * Reconnects with exponential backoff on disconnect.
 * On each message, dispatches to the batchStore Zustand store.
 */

"use client";

import { useEffect, useRef, useCallback } from "react";
import { useBatchStore } from "@/store/batchStore";
import { env } from "@/lib/env";

const WS_BASE = env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:8000/ws";
const MAX_BACKOFF_MS = 30_000;

export function useWebSocket(batchId: string | null) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptRef = useRef(0);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { handleWebSocketEvent } = useBatchStore();

  const connect = useCallback(() => {
    if (!batchId) return;

    const url = `${WS_BASE}/batch/${batchId}`;
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      reconnectAttemptRef.current = 0;
      console.info(`[WS] Connected to batch ${batchId}`);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        handleWebSocketEvent(data);
      } catch {
        console.warn("[WS] Failed to parse message", event.data);
      }
    };

    ws.onerror = (err) => {
      console.warn("[WS] Error", err);
    };

    ws.onclose = (event) => {
      console.info(`[WS] Disconnected (code ${event.code})`);
      // Reconnect with exponential backoff
      const attempt = reconnectAttemptRef.current;
      const delay = Math.min(1000 * 2 ** attempt, MAX_BACKOFF_MS);
      reconnectAttemptRef.current += 1;

      reconnectTimerRef.current = setTimeout(() => {
        console.info(`[WS] Reconnecting (attempt ${attempt + 1})...`);
        connect();
      }, delay);
    };
  }, [batchId, handleWebSocketEvent]);

  useEffect(() => {
    connect();
    return () => {
      // Cleanup on unmount
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      if (wsRef.current) {
        wsRef.current.onclose = null; // Prevent reconnect loop on unmount
        wsRef.current.close();
      }
    };
  }, [connect]);
}
