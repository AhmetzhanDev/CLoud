import { NavLink } from 'react-router-dom';
import { 
  BookOpen, 
  Search, 
  FileQuestion, 
  TrendingUp, 
  StickyNote,
  Lightbulb,
  X
} from 'lucide-react';
import { t } from '../i18n';

const navItems = [
  { path: '/library', label: t('nav.library'), icon: BookOpen },
  { path: '/search', label: t('nav.search'), icon: Search },
  { path: '/directions', label: t('nav.directions'), icon: Lightbulb },
  { path: '/quiz', label: t('nav.quiz'), icon: FileQuestion },
  { path: '/progress', label: t('nav.progress'), icon: TrendingUp },
  { path: '/notes', label: t('nav.notes'), icon: StickyNote },
  // Отдельная кнопка для игры «найди пары» сразу под Notes
  { 
    path: '/quiz?mode=matching', 
    label: t('nav.quizMatching'), 
    icon: FileQuestion,
    highlight: true,
  },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  return (
    <>
      {/* Sidebar */}
      <aside 
        className={`
          fixed lg:static inset-y-0 left-0 z-30
          w-64 bg-white border-r border-gray-200 flex flex-col
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary-600">
            {t('app.title')}
          </h1>
          <button
            onClick={onClose}
            className="lg:hidden p-1 hover:bg-gray-100 rounded transition-colors"
            aria-label="Close sidebar"
          >
            <X size={20} className="text-gray-600" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    onClick={() => {
                      // Close sidebar on mobile when navigating
                      if (window.innerWidth < 1024) {
                        onClose();
                      }
                    }}
                  className={({ isActive }) => {
                    const base = 'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200';
                    const active = 'bg-primary-50 text-primary-700 font-medium shadow-sm border-l-4 border-primary-600';
                    const inactive = 'text-gray-700 hover:bg-gray-100 border-l-4 border-transparent';
                    const highlight = item.highlight
                      ? 'ring-1 ring-amber-200 bg-gradient-to-r from-amber-50/70 to-yellow-50 hover:from-amber-100 hover:to-yellow-50'
                      : '';
                    return `${base} ${isActive ? active : inactive} ${highlight}`.trim();
                  }}
                  >
                    {({ isActive }) => (
                      <>
                        <Icon 
                          size={20} 
                          className={isActive ? 'text-primary-600' : 'text-gray-500'}
                        />
                        <span className="flex-1">{item.label}</span>
                        {item.highlight && (
                          <span className="text-[11px] font-semibold text-amber-700 bg-amber-100 px-2 py-1 rounded-full shadow-inner">
                            New
                          </span>
                        )}
                      </>
                    )}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <div className="text-xs text-gray-500 text-center">
            <p>{t('app.title')} v1.0</p>
          </div>
        </div>
      </aside>
    </>
  );
}
