import { useState } from 'react';
import { User, Bell, Search, Menu } from 'lucide-react';
import { useUserStore } from '@/store/userStore';
import { useNavigate } from 'react-router-dom';
import { t } from '@/i18n';
import LanguageSwitcher from './LanguageSwitcher';

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const { user } = useUserStore();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  // Mock notifications - in real app, this would come from a store
  const notifications = [
    { id: 1, message: 'New achievement unlocked!', time: '5m ago', unread: true },
    { id: 2, message: 'Quiz results available', time: '1h ago', unread: true },
    { id: 3, message: 'Article analysis complete', time: '2h ago', unread: false },
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 px-4 md:px-6 py-4 sticky top-0 z-10">
      <div className="flex items-center justify-between gap-4">
        {/* Left Section: Menu Button + Search */}
        <div className="flex items-center gap-4 flex-1">
          {/* Mobile Menu Button */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Toggle menu"
          >
            <Menu size={20} className="text-gray-600" />
          </button>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-md hidden md:block">
            <div className="relative">
              <Search 
                size={18} 
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('library.search')}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              />
            </div>
          </form>
        </div>

        {/* Right Section: Language + Notifications + Profile */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Mobile Search Button */}
          <button 
            onClick={() => navigate('/search')}
            className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Search"
          >
            <Search size={20} className="text-gray-600" />
          </button>

          {/* Language Switcher */}
          <LanguageSwitcher />

          {/* Notifications */}
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Notifications"
            >
              <Bell size={20} className="text-gray-600" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setShowNotifications(false)}
                />
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                  <div className="p-4 border-b border-gray-200">
                    <h3 className="font-semibold text-gray-900">Уведомления</h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                            notification.unread ? 'bg-primary-50' : ''
                          }`}
                        >
                          <p className="text-sm text-gray-900">{notification.message}</p>
                          <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-gray-500">
                        Нет уведомлений
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* User Profile */}
          <div className="relative">
            <button
              onClick={() => setShowProfile(!showProfile)}
              className="flex items-center gap-3 pl-2 md:pl-4 border-l border-gray-200 hover:bg-gray-50 rounded-lg transition-colors p-2"
            >
              <div className="text-right hidden md:block">
                <p className="text-sm font-medium text-gray-900">
                  {user?.name || t('user.guest')}
                </p>
                <p className="text-xs text-gray-500">
                  {t('user.level')} {user?.level || 1} • {user?.points || 0} {t('user.points')}
                </p>
              </div>
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                <User size={20} className="text-primary-600" />
              </div>
            </button>

            {/* Profile Dropdown */}
            {showProfile && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setShowProfile(false)}
                />
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                  <div className="p-4 border-b border-gray-200">
                    <p className="font-semibold text-gray-900">
                      {user?.name || t('user.guest')}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {t('user.level')} {user?.level || 1}
                    </p>
                    <div className="mt-2">
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>До уровня {(user?.level || 1) + 1}</span>
                        <span>{user?.points || 0} {t('user.points')}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-primary-600 h-2 rounded-full transition-all"
                          style={{ width: `${((user?.points || 0) % 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="p-2">
                    <button
                      onClick={() => {
                        navigate('/progress');
                        setShowProfile(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors"
                    >
                      Посмотреть прогресс
                    </button>
                    <button
                      onClick={() => {
                        // Handle settings
                        setShowProfile(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors"
                    >
                      Настройки
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
