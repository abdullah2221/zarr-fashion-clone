import WebSocket from 'ws';

/**
 * Supabase Realtime is constructed eagerly by supabase-js. Node < 22 does not
 * provide a native WebSocket, so SSR needs a server-only transport available
 * before Angular services create the client.
 */
export function installServerWebSocketTransport() {
  if (typeof globalThis.WebSocket === 'undefined') {
    (globalThis as typeof globalThis & { WebSocket?: typeof globalThis.WebSocket }).WebSocket =
      WebSocket as unknown as typeof globalThis.WebSocket;
  }
}
