import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const INITIAL_NOTIFICATIONS = [
  {
    id: 'notif-1',
    title: 'Humidity Alert in Gallery 3',
    message: 'Relative humidity reached 68% (threshold 60%). Inspect climate control unit near Adwa Weapons Exhibit.',
    category: 'conservation',
    priority: 'urgent',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(), // 12 mins ago
    link: '/conservation',
    actionText: 'View Conservation',
  },
  {
    id: 'notif-2',
    title: 'VIP Foreign Delegation Booking',
    message: '15 VIP tickets requested for diplomatic delegation on July 28, 2026. Pending curator approval.',
    category: 'tickets',
    priority: 'warning',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 mins ago
    link: '/tickets',
    actionText: 'Verify Booking',
  },
  {
    id: 'notif-3',
    title: 'AI Metadata Generation Complete',
    message: 'AI vision model enriched catalog metadata & historical tags for "Emperor Menelik II Ceremonial Sword".',
    category: 'ai',
    priority: 'info',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    link: '/artifacts',
    actionText: 'Review Artifact',
  },
  {
    id: 'notif-4',
    title: 'Automated Database Snapshot',
    message: 'Nightly database snapshot & audit log backup archived successfully (Size: 420 MB).',
    category: 'system',
    priority: 'info',
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 14).toISOString(), // 14 hours ago
    link: '/admin',
    actionText: 'System Logs',
  },
  {
    id: 'notif-5',
    title: 'Artifact Movement Registered',
    message: 'Crown of Empress Taytu relocated from Vault A to Main Exhibition Hall Display #4.',
    category: 'conservation',
    priority: 'info',
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 28).toISOString(), // 28 hours ago
    link: '/artifacts',
    actionText: 'Track Location',
  },
];

const SIMULATED_SAMPLES = [
  {
    title: 'Condition Check Due',
    message: 'Scheduled 90-day condition report for Ras Alula Engida Shield is due today.',
    category: 'conservation',
    priority: 'warning',
    link: '/conservation',
    actionText: 'Log Inspection',
  },
  {
    title: 'Daily Ticket Capacity Alert',
    message: 'Afternoon session for Hall B reached 92% ticket capacity (460/500 visitors).',
    category: 'tickets',
    priority: 'warning',
    link: '/tickets',
    actionText: 'Manage Quota',
  },
  {
    title: 'Potential Duplicate Artifact Flagged',
    message: 'AI duplicate scanner detected 94% similarity between Artifact #ADW-882 and #ADW-104.',
    category: 'ai',
    priority: 'urgent',
    link: '/artifacts',
    actionText: 'Resolve Duplicate',
  },
  {
    title: 'New Staff Permission Granted',
    message: 'Curator role permissions updated for Conservation Team by Admin.',
    category: 'system',
    priority: 'info',
    link: '/admin',
    actionText: 'Access Settings',
  },
];

export const useNotificationStore = create(
  persist(
    (set, get) => ({
      notifications: INITIAL_NOTIFICATIONS,
      isModalOpen: false,

      // Selectors & Getters
      getUnreadCount: () => get().notifications.filter((n) => !n.read).length,

      // Modal State
      openModal: () => set({ isModalOpen: true }),
      closeModal: () => set({ isModalOpen: false }),
      toggleModal: () => set((state) => ({ isModalOpen: !state.isModalOpen })),

      // Actions
      markAsRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
        })),

      markAsUnread: (id) =>
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: false } : n
          ),
        })),

      markAllAsRead: () =>
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
        })),

      deleteNotification: (id) =>
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        })),

      clearAllRead: () =>
        set((state) => ({
          notifications: state.notifications.filter((n) => !n.read),
        })),

      clearAll: () => set({ notifications: [] }),

      addNotification: (notification) =>
        set((state) => ({
          notifications: [
            {
              id: `notif-${Date.now()}`,
              createdAt: new Date().toISOString(),
              read: false,
              priority: 'info',
              category: 'system',
              ...notification,
            },
            ...state.notifications,
          ],
        })),

      simulateNotification: () => {
        const randomSample =
          SIMULATED_SAMPLES[Math.floor(Math.random() * SIMULATED_SAMPLES.length)];
        const newNotif = {
          id: `notif-${Date.now()}`,
          createdAt: new Date().toISOString(),
          read: false,
          ...randomSample,
        };
        set((state) => ({
          notifications: [newNotif, ...state.notifications],
        }));
        return newNotif;
      },

      resetToDefaults: () => set({ notifications: INITIAL_NOTIFICATIONS }),
    }),
    {
      name: 'smrmp-notifications-storage',
      partialize: (state) => ({ notifications: state.notifications }),
    }
  )
);

export default useNotificationStore;
