import api from './axios';
import { isBackendError } from './mockStore';

const MOCK_USERS_STORAGE_KEY = 'smrmp_mock_users';

export const INITIAL_STAFF_USERS = [
  {
    id: 'usr-101',
    name: 'Eleni Wolde',
    email: 'eleni.admin@adwamuseum.gov.et',
    phone: '+251911223344',
    role: 'admin',
    department: 'Administration & IT',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
    created_at: '2026-01-10T08:00:00.000Z',
    last_login: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'usr-102',
    name: 'Kassahun Tadesse',
    email: 'kassahun.curator@adwamuseum.gov.et',
    phone: '+251922334455',
    role: 'curator',
    department: 'Curatorial & Exhibitions',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    created_at: '2026-02-15T09:15:00.000Z',
    last_login: new Date(Date.now() - 3600000 * 6).toISOString(),
  },
  {
    id: 'usr-103',
    name: 'Dr. Rahel Bekele',
    email: 'rahel.conservation@adwamuseum.gov.et',
    phone: '+251933445566',
    role: 'conservation',
    department: 'Conservation & Restoration',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200',
    created_at: '2026-03-01T10:00:00.000Z',
    last_login: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    id: 'usr-104',
    name: 'Yonas Getachew',
    email: 'yonas.maint@adwamuseum.gov.et',
    phone: '+251944556677',
    role: 'maintenance',
    department: 'Facilities & Maintenance',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
    created_at: '2026-04-12T11:30:00.000Z',
    last_login: new Date(Date.now() - 3600000 * 48).toISOString(),
  },
  {
    id: 'usr-105',
    name: 'Tewodros Haile',
    email: 'tewodros.research@adwamuseum.gov.et',
    phone: '+251955667788',
    role: 'researcher',
    department: 'Research & Archival',
    status: 'inactive',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200',
    created_at: '2026-05-20T14:00:00.000Z',
    last_login: new Date(Date.now() - 3600000 * 120).toISOString(),
  },
];

function getStoredMockUsers() {
  try {
    const stored = localStorage.getItem(MOCK_USERS_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading mock users from localStorage:', e);
  }
  localStorage.setItem(MOCK_USERS_STORAGE_KEY, JSON.stringify(INITIAL_STAFF_USERS));
  return INITIAL_STAFF_USERS;
}

function saveStoredMockUsers(users) {
  try {
    localStorage.setItem(MOCK_USERS_STORAGE_KEY, JSON.stringify(users));
  } catch (e) {
    console.error('Error saving mock users to localStorage:', e);
  }
}

export const userApi = {
  // GET /users
  getUsers: async (params = {}) => {
    try {
      return await api.get('/users', { params });
    } catch (error) {
      if (isBackendError(error)) {
        let users = getStoredMockUsers();

        // Exclude visitors if explicitly requested or by default for staff management
        if (params.excludeVisitors !== false) {
          users = users.filter((u) => u.role !== 'visitor');
        }

        if (params.search) {
          const q = params.search.toLowerCase();
          users = users.filter(
            (u) =>
              u.name.toLowerCase().includes(q) ||
              u.email.toLowerCase().includes(q) ||
              (u.phone && u.phone.toLowerCase().includes(q)) ||
              (u.department && u.department.toLowerCase().includes(q))
          );
        }

        if (params.role) {
          users = users.filter((u) => u.role === params.role);
        }

        if (params.status) {
          users = users.filter((u) => u.status === params.status);
        }

        return {
          data: {
            success: true,
            data: {
              users,
              pagination: {
                total: users.length,
                page: 1,
                limit: 50,
                totalPages: 1,
              },
            },
          },
        };
      }
      throw error;
    }
  },

  // GET /users/:id
  getUserById: async (id) => {
    try {
      return await api.get(`/users/${id}`);
    } catch (error) {
      if (isBackendError(error)) {
        const users = getStoredMockUsers();
        const found = users.find((u) => u.id === id);
        if (found) {
          return { data: { success: true, data: { user: found } } };
        }
      }
      throw error;
    }
  },

  // POST /users (Add new staff user)
  createUser: async (userData) => {
    // Validate role isn't visitor
    if (userData.role === 'visitor') {
      throw new Error('Visitor accounts cannot be created manually in staff management.');
    }

    try {
      return await api.post('/users', userData);
    } catch (error) {
      if (isBackendError(error)) {
        const users = getStoredMockUsers();

        // Check duplicate email
        const existing = users.find(
          (u) => u.email.toLowerCase() === (userData.email || '').toLowerCase()
        );
        if (existing) {
          const err = new Error('A user with this email address already exists.');
          err.response = { data: { message: 'A user with this email address already exists.' } };
          throw err;
        }

        const newUser = {
          id: `usr-${Date.now()}`,
          name: userData.name,
          email: userData.email,
          phone: userData.phone || '',
          role: userData.role,
          department: userData.department || 'General Staff',
          status: userData.status || 'active',
          avatar: userData.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name)}&background=FAF0D8&color=7C4A2D&bold=true`,
          created_at: new Date().toISOString(),
          last_login: null,
        };

        const updatedUsers = [newUser, ...users];
        saveStoredMockUsers(updatedUsers);

        return {
          data: {
            success: true,
            message: 'User created successfully',
            data: { user: newUser },
          },
        };
      }
      throw error;
    }
  },

  // PUT /users/:id
  updateUser: async (id, userData) => {
    if (userData.role === 'visitor') {
      throw new Error('User role cannot be set to visitor in staff management.');
    }

    try {
      return await api.put(`/users/${id}`, userData);
    } catch (error) {
      if (isBackendError(error)) {
        const users = getStoredMockUsers();
        const index = users.findIndex((u) => u.id === id);
        if (index !== -1) {
          users[index] = {
            ...users[index],
            ...userData,
            updated_at: new Date().toISOString(),
          };
          saveStoredMockUsers(users);
          return {
            data: {
              success: true,
              message: 'User updated successfully',
              data: { user: users[index] },
            },
          };
        }
      }
      throw error;
    }
  },

  // PATCH /users/:id/status
  toggleUserStatus: async (id, isActive) => {
    try {
      return await api.patch(`/users/${id}/status`, { is_active: isActive });
    } catch (error) {
      if (isBackendError(error)) {
        const users = getStoredMockUsers();
        const index = users.findIndex((u) => u.id === id);
        if (index !== -1) {
          const newStatus =
            isActive === undefined
              ? users[index].status === 'active'
                ? 'inactive'
                : 'active'
              : isActive
                ? 'active'
                : 'inactive';
          users[index] = {
            ...users[index],
            status: newStatus,
            updated_at: new Date().toISOString(),
          };
          saveStoredMockUsers(users);
          return {
            data: {
              success: true,
              message: `User status changed to ${newStatus}`,
              data: { user: users[index] },
            },
          };
        }
      }
      throw error;
    }
  },

  // DELETE /users/:id
  deleteUser: async (id) => {
    try {
      return await api.delete(`/users/${id}`);
    } catch (error) {
      if (isBackendError(error)) {
        const users = getStoredMockUsers();
        const filtered = users.filter((u) => u.id !== id);
        saveStoredMockUsers(filtered);
        return {
          data: {
            success: true,
            message: 'User deleted successfully',
          },
        };
      }
      throw error;
    }
  },
};

export default userApi;
