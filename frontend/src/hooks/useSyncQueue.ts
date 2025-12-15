import { useState, useEffect } from 'react';
import { syncQueue, QueuedRequest } from '@/utils/syncQueue';

export function useSyncQueue() {
  const [queue, setQueue] = useState<QueuedRequest[]>([]);
  const [queueSize, setQueueSize] = useState(0);

  useEffect(() => {
    // Initial load
    updateQueue();

    // Update queue periodically
    const interval = setInterval(updateQueue, 5000);

    // Listen for online events
    const handleOnline = () => {
      updateQueue();
    };

    window.addEventListener('online', handleOnline);

    return () => {
      clearInterval(interval);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  const updateQueue = () => {
    setQueue(syncQueue.getQueue());
    setQueueSize(syncQueue.getQueueSize());
  };

  const processQueue = async () => {
    await syncQueue.processQueue();
    updateQueue();
  };

  const clearQueue = () => {
    syncQueue.clearQueue();
    updateQueue();
  };

  const removeRequest = (id: string) => {
    syncQueue.removeRequest(id);
    updateQueue();
  };

  return {
    queue,
    queueSize,
    processQueue,
    clearQueue,
    removeRequest,
  };
}
