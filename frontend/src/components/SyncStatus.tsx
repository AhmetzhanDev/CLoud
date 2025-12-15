import React from 'react';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { useSyncQueue } from '@/hooks/useSyncQueue';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';

export const SyncStatus: React.FC = () => {
  const { queueSize, processQueue } = useSyncQueue();
  const isOnline = useOnlineStatus();

  if (queueSize === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-40 bg-white rounded-lg shadow-lg border border-gray-200 p-4 max-w-sm">
      <div className="flex items-start gap-3">
        {isOnline ? (
          <RefreshCw className="w-5 h-5 text-blue-600 animate-spin flex-shrink-0 mt-0.5" />
        ) : (
          <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
        )}
        
        <div className="flex-1">
          <h3 className="font-medium text-gray-900 mb-1">
            {isOnline ? 'Синхронизация...' : 'Ожидание подключения'}
          </h3>
          <p className="text-sm text-gray-600 mb-2">
            {queueSize} {queueSize === 1 ? 'запрос' : 'запросов'} в очереди
          </p>
          
          {isOnline && (
            <button
              onClick={processQueue}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Синхронизировать сейчас
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
