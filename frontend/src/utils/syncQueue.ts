// Sync Queue for offline requests
import { api } from '@/services/api';

export interface QueuedRequest {
  id: string;
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  data?: any;
  timestamp: number;
  retries: number;
}

const QUEUE_KEY = 'sync_queue';
const MAX_RETRIES = 3;

class SyncQueue {
  private queue: QueuedRequest[] = [];
  private processing = false;

  constructor() {
    this.loadQueue();
    this.setupOnlineListener();
  }

  private loadQueue() {
    try {
      const stored = localStorage.getItem(QUEUE_KEY);
      if (stored) {
        this.queue = JSON.parse(stored);
      }
    } catch (error) {
      console.error('[SyncQueue] Failed to load queue:', error);
      this.queue = [];
    }
  }

  private saveQueue() {
    try {
      localStorage.setItem(QUEUE_KEY, JSON.stringify(this.queue));
    } catch (error) {
      console.error('[SyncQueue] Failed to save queue:', error);
    }
  }

  private setupOnlineListener() {
    window.addEventListener('online', () => {
      console.log('[SyncQueue] Back online, processing queue...');
      this.processQueue();
    });
  }

  add(request: Omit<QueuedRequest, 'id' | 'timestamp' | 'retries'>) {
    const queuedRequest: QueuedRequest = {
      ...request,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      retries: 0,
    };

    this.queue.push(queuedRequest);
    this.saveQueue();

    console.log('[SyncQueue] Added request to queue:', queuedRequest);

    // Try to process immediately if online
    if (navigator.onLine) {
      this.processQueue();
    }
  }

  async processQueue() {
    if (this.processing || !navigator.onLine || this.queue.length === 0) {
      return;
    }

    this.processing = true;
    console.log('[SyncQueue] Processing queue, items:', this.queue.length);

    const failedRequests: QueuedRequest[] = [];

    for (const request of this.queue) {
      try {
        await this.executeRequest(request);
        console.log('[SyncQueue] Successfully processed:', request.id);
      } catch (error) {
        console.error('[SyncQueue] Failed to process:', request.id, error);

        request.retries++;

        if (request.retries < MAX_RETRIES) {
          failedRequests.push(request);
        } else {
          console.warn('[SyncQueue] Max retries reached, dropping request:', request.id);
        }
      }
    }

    this.queue = failedRequests;
    this.saveQueue();
    this.processing = false;

    console.log('[SyncQueue] Queue processing complete, remaining:', this.queue.length);
  }

  private async executeRequest(request: QueuedRequest) {
    const { url, method, data } = request;

    switch (method) {
      case 'GET':
        return await api.get(url);
      case 'POST':
        return await api.post(url, data);
      case 'PUT':
        return await api.put(url, data);
      case 'DELETE':
        return await api.delete(url);
      default:
        throw new Error(`Unsupported method: ${method}`);
    }
  }

  getQueue(): QueuedRequest[] {
    return [...this.queue];
  }

  getQueueSize(): number {
    return this.queue.length;
  }

  clearQueue() {
    this.queue = [];
    this.saveQueue();
    console.log('[SyncQueue] Queue cleared');
  }

  removeRequest(id: string) {
    this.queue = this.queue.filter((req) => req.id !== id);
    this.saveQueue();
  }
}

// Singleton instance
export const syncQueue = new SyncQueue();

// Helper function to queue a request when offline
export function queueRequestIfOffline(
  url: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  data?: any
): boolean {
  if (!navigator.onLine) {
    syncQueue.add({ url, method, data });
    return true;
  }
  return false;
}
