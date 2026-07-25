// In-memory notifications store for MVP / demonstration
let systemNotifications = [
  {
    id: 'notif-1',
    title: 'Humidity Alert in Gallery 3',
    message: 'Relative humidity reached 68% (threshold 60%). Inspect climate control unit near Adwa Weapons Exhibit.',
    category: 'conservation',
    priority: 'urgent',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
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
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
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
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
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
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 14).toISOString(),
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
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 28).toISOString(),
    link: '/artifacts',
    actionText: 'Track Location',
  },
];

const getNotifications = async (req, res) => {
  try {
    const unreadCount = systemNotifications.filter((n) => !n.read).length;
    res.json({
      success: true,
      unreadCount,
      data: systemNotifications,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    systemNotifications = systemNotifications.map((n) =>
      n.id === id ? { ...n, read: true } : n
    );
    res.json({ success: true, message: 'Notification marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const markAllAsRead = async (req, res) => {
  try {
    systemNotifications = systemNotifications.map((n) => ({ ...n, read: true }));
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    systemNotifications = systemNotifications.filter((n) => n.id !== id);
    res.json({ success: true, message: 'Notification deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createNotification = async (req, res) => {
  try {
    const { title, message, category, priority, link, actionText } = req.body;
    const newNotif = {
      id: `notif-${Date.now()}`,
      title: title || 'System Alert',
      message: message || '',
      category: category || 'system',
      priority: priority || 'info',
      read: false,
      createdAt: new Date().toISOString(),
      link: link || '/dashboard',
      actionText: actionText || 'View Details',
    };
    systemNotifications.unshift(newNotif);
    res.status(201).json({ success: true, data: newNotif });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  createNotification,
};
