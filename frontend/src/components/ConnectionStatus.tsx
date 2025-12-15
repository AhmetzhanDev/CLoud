import React, { useEffect, useState } from 'react';
import { WifiOff, Wifi } from 'lucide-react';

interface ConnectionStatusProps {
  className?: string;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ className = '' }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setNotificationMessage('Подключение восстановлено');
      setShowNotification(true);
      
      // Hide notification after 3 seconds
      setTimeout(() => {
        setShowNotification(false);
      }, 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setNotificationMessage('Нет подключения к интернету');
      setShowNotification(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showNotification && isOnline) {
    return null;
  }

  return (
    <>
      {/* Persistent offline indicator */}
      {!isOnline && (
        <div className={`fixed top-0 left-0 right-0 z-50 bg-red-600 text-white py-2 px-4 ${className}`}>
          <div className="container mx-auto flex items-center justify-center gap-2">
            <WifiOff className="w-5 h-5" />
            <span className="font-medium">Нет подключения к интернету</span>
            <span className="text-sm opacity-90">
              - Некоторые функции недоступны
            </span>
          </div>
        </div>
      )}

      {/* Temporary notification */}
      {showNotification && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg transition-all duration-300 ${
            isOnline
              ? 'bg-green-600 text-white'
              : 'bg-red-600 text-white'
          }`}
        >
          <div className="flex items-center gap-2">
            {isOnline ? (
              <Wifi className="w-5 h-5" />
            ) : (
              <WifiOff className="w-5 h-5" />
            )}
            <span className="font-medium">{notificationMessage}</span>
          </div>
        </div>
      )}
    </>
  );
};
