/**
 * Low-level Deriv public WebSocket client.
 * Connects to: wss://api.derivws.com/trading/v1/options/ws/public
 * Handles: connect, reconnect, req_id routing, subscriptions.
 */

type MessageHandler = (data: any) => void;

const WS_URL = 'wss://api.derivws.com/trading/v1/options/ws/public';
const RECONNECT_DELAYS = [1000, 2000, 4000, 8000, 15000]; // escalating backoff

class DerivClient {
  private ws: WebSocket | null = null;
  private reqId = 0;
  private pendingRequests = new Map<number, { resolve: (data: any) => void; reject: (err: Error) => void }>();
  private subscriptionHandlers = new Map<string, MessageHandler>(); // subscription_id -> handler
  private symbolHandlers = new Map<string, MessageHandler>(); // symbol -> handler (for ticks)
  private reconnectAttempt = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private intentionallyClosed = false;
  private connectPromise: Promise<void> | null = null;
  private _onStatusChange: ((status: 'connecting' | 'connected' | 'disconnected' | 'error') => void) | null = null;

  get isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  onStatusChange(cb: (status: 'connecting' | 'connected' | 'disconnected' | 'error') => void) {
    this._onStatusChange = cb;
  }

  connect(): Promise<void> {
    if (this.connectPromise) return this.connectPromise;
    this.intentionallyClosed = false;

    this.connectPromise = new Promise((resolve, reject) => {
      this._onStatusChange?.('connecting');

      try {
        this.ws = new WebSocket(WS_URL);
      } catch (err) {
        this._onStatusChange?.('error');
        this.connectPromise = null;
        reject(err);
        return;
      }

      this.ws.onopen = () => {
        this.reconnectAttempt = 0;
        this._onStatusChange?.('connected');
        this.connectPromise = null;
        resolve();
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleMessage(data);
        } catch {
          // ignore parse errors
        }
      };

      this.ws.onerror = () => {
        this._onStatusChange?.('error');
      };

      this.ws.onclose = () => {
        this._onStatusChange?.('disconnected');
        this.connectPromise = null;
        if (!this.intentionallyClosed) {
          this.scheduleReconnect();
        }
      };
    });

    return this.connectPromise;
  }

  disconnect() {
    this.intentionallyClosed = true;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.subscriptionHandlers.clear();
    this.symbolHandlers.clear();
    for (const { reject } of this.pendingRequests.values()) {
      reject(new Error('Connection closed'));
    }
    this.pendingRequests.clear();
    this.ws?.close();
    this.ws = null;
    this.connectPromise = null;
  }

  /**
   * Send a request and wait for the response matched by req_id.
   */
  async send<T = any>(payload: Record<string, any>): Promise<T> {
    if (!this.isConnected) {
      await this.connect();
    }

    const reqId = ++this.reqId;
    const message = { ...payload, req_id: reqId };

    return new Promise((resolve, reject) => {
      this.pendingRequests.set(reqId, { resolve, reject });

      // Timeout after 15s
      const timer = setTimeout(() => {
        this.pendingRequests.delete(reqId);
        reject(new Error(`Request ${reqId} timed out`));
      }, 15000);

      const wrappedResolve = (data: T) => {
        clearTimeout(timer);
        resolve(data);
      };
      this.pendingRequests.set(reqId, { resolve: wrappedResolve, reject: (err) => { clearTimeout(timer); reject(err); } });

      this.ws!.send(JSON.stringify(message));
    });
  }

  /**
   * Subscribe to a tick stream. Returns an unsubscribe function.
   */
  subscribeTicks(symbol: string, handler: MessageHandler): () => void {
    this.symbolHandlers.set(symbol, handler);

    // Send subscribe request (fire-and-forget, ticks arrive as stream)
    const reqId = ++this.reqId;
    const msg = { ticks: symbol, subscribe: 1, req_id: reqId };

    if (this.isConnected) {
      this.ws!.send(JSON.stringify(msg));
    }

    return () => {
      this.symbolHandlers.delete(symbol);
      // Send forget for this symbol's subscription
      if (this.isConnected) {
        this.ws!.send(JSON.stringify({ forget_all: 'ticks', req_id: ++this.reqId }));
      }
    };
  }

  private handleMessage(data: any) {
    const reqId = data.req_id as number | undefined;

    // Error response
    if (data.error) {
      if (reqId && this.pendingRequests.has(reqId)) {
        const { reject } = this.pendingRequests.get(reqId)!;
        this.pendingRequests.delete(reqId);
        reject(new Error(data.error.message || 'Deriv API error'));
      }
      return;
    }

    // Resolve pending request-response
    if (reqId && this.pendingRequests.has(reqId)) {
      const { resolve } = this.pendingRequests.get(reqId)!;
      this.pendingRequests.delete(reqId);
      resolve(data);
    }

    // Handle tick stream messages
    if (data.msg_type === 'tick' && data.tick) {
      const symbol = data.tick.symbol as string;
      const handler = this.symbolHandlers.get(symbol);
      handler?.(data);
    }

    // Handle subscription ID tracking
    if (data.subscription?.id) {
      const subId = data.subscription.id as string;
      if (data.tick?.symbol) {
        const symbol = data.tick.symbol as string;
        const handler = this.symbolHandlers.get(symbol);
        if (handler) {
          this.subscriptionHandlers.set(subId, handler);
        }
      }
    }
  }

  private scheduleReconnect() {
    const delay = RECONNECT_DELAYS[Math.min(this.reconnectAttempt, RECONNECT_DELAYS.length - 1)];
    this.reconnectAttempt++;

    this.reconnectTimer = setTimeout(async () => {
      this.reconnectTimer = null;
      try {
        await this.connect();
        // Resubscribe to all active symbol streams
        for (const [symbol] of this.symbolHandlers) {
          const reqId = ++this.reqId;
          this.ws?.send(JSON.stringify({ ticks: symbol, subscribe: 1, req_id: reqId }));
        }
      } catch {
        // will retry via onclose -> scheduleReconnect
      }
    }, delay);
  }
}

export const derivClient = new DerivClient();
