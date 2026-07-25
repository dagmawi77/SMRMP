import { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  BellIcon,
  XMarkIcon,
  CheckIcon,
  MagnifyingGlassIcon,
  TrashIcon,
  EnvelopeIcon,
  EnvelopeOpenIcon,
  SparklesIcon,
  TicketIcon,
  ShieldExclamationIcon,
  CpuChipIcon,
  Cog6ToothIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ArrowTopRightOnSquareIcon,
  ArrowPathIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import { useNotificationStore } from '../../store/notificationStore';

// Helper to format relative time
function formatRelativeTime(isoString) {
  if (!isoString) return 'Just now';
  const now = new Date();
  const past = new Date(isoString);
  const diffInSeconds = Math.floor((now - past) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  return past.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// Category Configuration with icons & colors
const CATEGORY_CONFIG = {
  conservation: {
    label: 'Conservation',
    icon: ShieldExclamationIcon,
    badgeBg: 'bg-amber-100 text-amber-900 border-amber-300',
    iconBg: 'bg-amber-500/10 text-amber-700 border-amber-300',
  },
  tickets: {
    label: 'Tickets',
    icon: TicketIcon,
    badgeBg: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    iconBg: 'bg-emerald-500/10 text-emerald-700 border-emerald-300',
  },
  ai: {
    label: 'AI & Catalog',
    icon: SparklesIcon,
    badgeBg: 'bg-purple-100 text-purple-900 border-purple-300',
    iconBg: 'bg-purple-500/10 text-purple-700 border-purple-300',
  },
  system: {
    label: 'System',
    icon: CpuChipIcon,
    badgeBg: 'bg-blue-100 text-blue-900 border-blue-300',
    iconBg: 'bg-blue-500/10 text-blue-700 border-blue-300',
  },
};

// Priority Configuration
const PRIORITY_CONFIG = {
  urgent: {
    label: 'Urgent',
    pillBg: 'bg-red-50 text-red-700 border-red-200',
    icon: ExclamationTriangleIcon,
  },
  warning: {
    label: 'Warning',
    pillBg: 'bg-amber-50 text-amber-800 border-amber-200',
    icon: ExclamationTriangleIcon,
  },
  info: {
    label: 'Info',
    pillBg: 'bg-blue-50 text-blue-700 border-blue-200',
    icon: InformationCircleIcon,
  },
};

export default function NotificationModal() {
  const navigate = useNavigate();
  const modalRef = useRef(null);
  const {
    notifications,
    isModalOpen,
    closeModal,
    markAsRead,
    markAsUnread,
    markAllAsRead,
    deleteNotification,
    clearAllRead,
    simulateNotification,
    resetToDefaults,
  } = useNotificationStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);

  // Click-outside and Escape key detection
  useEffect(() => {
    if (!isModalOpen) return undefined;

    const handleClickOutside = (event) => {
      // Don't close if click was inside the notification container or notification trigger button
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        closeModal();
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        closeModal();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isModalOpen, closeModal]);

  // Tab count mapping
  const categoryCounts = useMemo(() => {
    return {
      all: notifications.length,
      unread: notifications.filter((n) => !n.read).length,
      conservation: notifications.filter((n) => n.category === 'conservation').length,
      tickets: notifications.filter((n) => n.category === 'tickets').length,
      ai: notifications.filter((n) => n.category === 'ai').length,
      system: notifications.filter((n) => n.category === 'system').length,
    };
  }, [notifications]);

  // Filtered notifications
  const filteredNotifications = useMemo(() => {
    return notifications.filter((notif) => {
      // Tab filter
      if (activeTab === 'unread' && notif.read) return false;
      if (activeTab !== 'all' && activeTab !== 'unread' && notif.category !== activeTab) {
        return false;
      }

      // Priority filter
      if (selectedPriority !== 'all' && notif.priority !== selectedPriority) return false;

      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchTitle = notif.title?.toLowerCase().includes(query);
        const matchMessage = notif.message?.toLowerCase().includes(query);
        if (!matchTitle && !matchMessage) return false;
      }

      return true;
    });
  }, [notifications, activeTab, selectedPriority, searchQuery]);

  if (!isModalOpen) return null;

  const handleActionClick = (notif) => {
    if (!notif.read) markAsRead(notif.id);
    closeModal();
    if (notif.link) {
      navigate(notif.link);
    }
  };

  const handleSimulate = () => {
    const newNotif = simulateNotification();
    toast.success(`New alert: "${newNotif.title}"`, {
      icon: '🔔',
    });
  };

  return (
    <>
      {/* Click-outside Backdrop Overlay */}
      <div
        className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[1px] transition-opacity"
        onClick={closeModal}
      />

      {/* Top-Right Anchored Dropdown Popover */}
      <div
        ref={modalRef}
        className="fixed right-3 sm:right-6 top-14 z-50 flex flex-col w-[calc(100vw-1.5rem)] sm:w-[440px] max-h-[calc(100vh-4.5rem)] rounded-2xl border border-smrmp-gold/40 bg-[#FAF6F0] text-[#2B1B12] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="notification-popover-title"
      >
        {/* Popover Header */}
        <div className="flex flex-col gap-2.5 border-b border-[#E2D6C5] bg-[#EFE5D8]/90 px-4 py-3 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-[#FAF0D8] text-[#7C4A2D] border border-smrmp-gold/40 shadow-2xs">
                <BellIcon className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-3.5 min-w-[14px] items-center justify-center rounded-full bg-red-600 px-1 text-[9px] font-black text-white shadow-2xs">
                    {unreadCount}
                  </span>
                )}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h2 id="notification-popover-title" className="font-display text-sm font-bold text-[#2B1B12]">
                    Notifications
                  </h2>
                  {unreadCount > 0 && (
                    <span className="rounded-full bg-red-100 px-1.5 py-0.2 text-[10px] font-bold text-red-800 border border-red-200">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-[#6E5445]">
                  Adwa Memorial operational updates & alerts
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleSimulate}
                title="Simulate incoming alert"
                className="inline-flex items-center gap-1 rounded-md border border-[#D4A017]/40 bg-[#FFFDF9] px-2 py-0.5 text-[11px] font-bold text-[#7C4A2D] shadow-2xs hover:bg-[#FAF0E4] transition-colors"
              >
                <PlusIcon className="h-3 w-3 text-smrmp-gold" />
                <span>Simulate</span>
              </button>

              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    markAllAsRead();
                    toast.success('All marked as read');
                  }}
                  className="inline-flex items-center gap-1 rounded-md border border-[#E2D6C5] bg-[#FFFDF9] px-2 py-0.5 text-[11px] font-semibold text-[#4A2C1B] hover:bg-[#FAF0E4] transition-colors"
                  title="Mark all as read"
                >
                  <CheckIcon className="h-3 w-3 text-emerald-700" />
                  <span>Mark Read</span>
                </button>
              )}

              <button
                type="button"
                onClick={closeModal}
                className="rounded-lg p-1 text-[#7C4A2D] hover:bg-[#FAF0E4] hover:text-[#2B1B12] transition-colors"
                aria-label="Close notifications"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Search & Priority Controls */}
          <div className="flex items-center gap-1.5 pt-0.5">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="absolute left-2.5 top-2 h-3.5 w-3.5 text-[#7C4A2D]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search alerts..."
                className="w-full rounded-md border border-[#E2D6C5] bg-[#FFFDF9] pl-8 pr-7 py-1 text-[11px] text-[#2B1B12] placeholder-[#8C6D58] focus:border-smrmp-gold focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1.5 text-[#8C6D58] hover:text-[#2B1B12]"
                >
                  <XMarkIcon className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-0.5 overflow-x-auto">
              {[
                { id: 'all', label: 'All' },
                { id: 'urgent', label: 'Urgent' },
                { id: 'warning', label: 'Warn' },
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setSelectedPriority(p.id)}
                  className={`rounded px-1.5 py-0.5 text-[10px] font-bold transition-all shrink-0 ${
                    selectedPriority === p.id
                      ? 'bg-[#2B1B12] text-[#FFFDF9]'
                      : 'bg-[#EFE5D8] text-[#6E5445] hover:bg-[#FAF0E4]'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Filter Pill Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pt-0.5 border-t border-[#E2D6C5]/60">
            {[
              { id: 'all', label: 'All', count: categoryCounts.all },
              { id: 'unread', label: 'Unread', count: categoryCounts.unread, highlight: true },
              { id: 'conservation', label: 'Conservation', count: categoryCounts.conservation },
              { id: 'tickets', label: 'Tickets', count: categoryCounts.tickets },
              { id: 'ai', label: 'AI Catalog', count: categoryCounts.ai },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1 whitespace-nowrap rounded-md px-2 py-0.5 text-[11px] font-bold transition-all ${
                  activeTab === tab.id
                    ? 'bg-[#374B07] text-[#FFFDF9]'
                    : 'bg-[#FAF0E4] text-[#6E5445] hover:bg-[#EFE5D8]'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`rounded-full px-1 py-0.1 text-[9px] ${
                    activeTab === tab.id
                      ? 'bg-[#243205] text-white'
                      : tab.highlight && tab.count > 0
                      ? 'bg-red-200 text-red-900 font-black'
                      : 'bg-[#E2D6C5] text-[#4A2C1B]'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Notifications Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2 divide-y divide-[#E2D6C5]/30">
          {filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#EFE5D8] text-[#7C4A2D] mb-2">
                <BellIcon className="h-5 w-5 opacity-60" />
              </div>
              <h3 className="text-xs font-bold text-[#2B1B12]">No notifications found</h3>
              <p className="mt-0.5 text-[11px] text-[#6E5445] max-w-xs">
                {searchQuery
                  ? `No matching alerts`
                  : activeTab === 'unread'
                  ? 'All caught up! No unread alerts.'
                  : 'No alerts in this category.'}
              </p>
              <button
                type="button"
                onClick={resetToDefaults}
                className="mt-3 flex items-center gap-1 rounded-md bg-[#FAF0D8] border border-smrmp-gold/50 px-2.5 py-1 text-[11px] font-bold text-[#7C4A2D] hover:bg-[#FAF0D8]/80"
              >
                <ArrowPathIcon className="h-3 w-3" />
                Restore Demo Alerts
              </button>
            </div>
          ) : (
            filteredNotifications.map((notif) => {
              const catConfig = CATEGORY_CONFIG[notif.category] || CATEGORY_CONFIG.system;
              const priorityConfig = PRIORITY_CONFIG[notif.priority] || PRIORITY_CONFIG.info;
              const CatIcon = catConfig.icon;
              const PriorityIcon = priorityConfig.icon;

              return (
                <div
                  key={notif.id}
                  className={`group relative flex items-start gap-2.5 rounded-xl p-2.5 transition-all pt-2.5 ${
                    !notif.read
                      ? 'bg-[#FFFDF9] border border-smrmp-gold/40 shadow-2xs'
                      : 'bg-transparent hover:bg-[#EFE5D8]/40 border border-transparent'
                  }`}
                >
                  {/* Category Icon */}
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border mt-0.5 ${catConfig.iconBg}`}
                  >
                    <CatIcon className="h-4 w-4" />
                  </div>

                  {/* Body Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {!notif.read && (
                          <span
                            className="inline-block h-2 w-2 rounded-full bg-amber-500 animate-pulse shrink-0"
                            title="Unread"
                          />
                        )}

                        <h4 className="text-xs font-bold text-[#2B1B12] leading-snug truncate max-w-[200px]">
                          {notif.title}
                        </h4>

                        <span
                          className={`inline-flex items-center gap-0.5 rounded px-1.5 py-0.2 text-[9px] font-bold border ${priorityConfig.pillBg}`}
                        >
                          <PriorityIcon className="h-2.5 w-2.5" />
                          {priorityConfig.label}
                        </span>
                      </div>

                      <span className="text-[10px] font-semibold text-[#8C6D58] shrink-0">
                        {formatRelativeTime(notif.createdAt)}
                      </span>
                    </div>

                    <p className="mt-1 text-[11px] text-[#5C4233] leading-relaxed line-clamp-2">
                      {notif.message}
                    </p>

                    {/* Bottom Action bar */}
                    <div className="mt-2 flex items-center justify-between pt-1 border-t border-[#E2D6C5]/30">
                      {notif.actionText && notif.link ? (
                        <button
                          type="button"
                          onClick={() => handleActionClick(notif)}
                          className="inline-flex items-center gap-1 text-[10px] font-bold text-[#374B07] hover:text-[#243205] transition-colors"
                        >
                          <span>{notif.actionText}</span>
                          <ArrowTopRightOnSquareIcon className="h-2.5 w-2.5" />
                        </button>
                      ) : (
                        <span />
                      )}

                      <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => (notif.read ? markAsUnread(notif.id) : markAsRead(notif.id))}
                          title={notif.read ? 'Mark as unread' : 'Mark as read'}
                          className="p-1 text-[#7C4A2D] hover:bg-[#FAF0E4] rounded transition-colors"
                        >
                          {notif.read ? (
                            <EnvelopeIcon className="h-3.5 w-3.5" />
                          ) : (
                            <EnvelopeOpenIcon className="h-3.5 w-3.5 text-emerald-700" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            deleteNotification(notif.id);
                            toast.success('Alert removed');
                          }}
                          title="Delete notification"
                          className="p-1 text-[#8C6D58] hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                        >
                          <TrashIcon className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Popover Footer */}
        <div className="flex items-center justify-between border-t border-[#E2D6C5] bg-[#EFE5D8]/80 px-4 py-2 shrink-0 text-[11px]">
          <span className="text-[#6E5445] font-semibold">
            {unreadCount > 0 ? `${unreadCount} unread alerts` : 'All alerts read'}
          </span>

          <div className="flex items-center gap-2.5">
            {notifications.some((n) => n.read) && (
              <button
                type="button"
                onClick={() => {
                  clearAllRead();
                  toast.success('Cleared read alerts');
                }}
                className="font-bold text-[#7C4A2D] hover:text-[#2B1B12] transition-colors"
              >
                Clear Read
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                closeModal();
                navigate('/settings');
              }}
              className="inline-flex items-center gap-1 font-bold text-[#374B07] hover:underline"
            >
              <Cog6ToothIcon className="h-3 w-3" />
              <span>Preferences</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
