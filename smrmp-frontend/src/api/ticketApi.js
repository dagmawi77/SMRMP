import api from './axios';
import { isBackendError, generateQRDataUrl } from './mockStore';

export const INITIAL_TICKET_TYPES = [
  { id: 'tt-1', type: 'adult', label: 'Adult Admission', price_etb: 150, description: 'Standard entry for local & international adult visitors', is_active: true },
  { id: 'tt-2', type: 'student', label: 'Student / Youth', price_etb: 50, description: 'Discounted entry with valid student or school ID', is_active: true },
  { id: 'tt-3', type: 'vip', label: 'VIP Guided Tour', price_etb: 500, description: 'All-access exhibition entry + dedicated curator guided tour', is_active: true },
  { id: 'tt-4', type: 'group', label: 'School / Delegations', price_etb: 300, description: 'Group package for up to 10 school or official visitors', is_active: true },
];

let localMockTickets = [
  {
    id: 'tkt-101',
    qr_ticket_code: 'TKT-884920',
    ticket_type: 'adult',
    quantity: 2,
    unit_price: 150,
    total_amount: 300,
    visitor_name: 'Dawit Abebe',
    visitor_phone: '+251911234567',
    visit_date: new Date().toISOString().split('T')[0],
    payment_method: 'telebirr',
    payment_status: 'completed',
    status: 'valid',
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'tkt-102',
    qr_ticket_code: 'TKT-492104',
    ticket_type: 'vip',
    quantity: 1,
    unit_price: 500,
    total_amount: 500,
    visitor_name: 'Bethlehem Tadesse',
    visitor_phone: '+251922883344',
    visit_date: new Date().toISOString().split('T')[0],
    payment_method: 'chapa',
    payment_status: 'completed',
    status: 'used',
    used_at: new Date(Date.now() - 3600000).toISOString(),
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: 'tkt-103',
    qr_ticket_code: 'TKT-193029',
    ticket_type: 'student',
    quantity: 5,
    unit_price: 50,
    total_amount: 250,
    visitor_name: 'Solomon Worku',
    visitor_phone: '+251933112255',
    visit_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    payment_method: 'cash',
    payment_status: 'completed',
    status: 'valid',
    created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
];

let localTicketTypes = [...INITIAL_TICKET_TYPES];

export const ticketApi = {
  // GET /tickets/types
  getTypes: async (params = {}) => {
    try {
      return await api.get('/tickets/types', { params });
    } catch (error) {
      if (isBackendError(error)) {
        return { data: { success: true, data: { ticket_types: localTicketTypes } } };
      }
      throw error;
    }
  },

  // POST /tickets/types
  createType: async (data) => {
    try {
      return await api.post('/tickets/types', data);
    } catch (error) {
      if (isBackendError(error)) {
        const newType = {
          id: `tt-${Date.now()}`,
          type: data.type || data.label.toLowerCase().replace(/\s+/g, '_'),
          label: data.label,
          price_etb: Number(data.price_etb),
          description: data.description || '',
          is_active: data.is_active !== undefined ? data.is_active : true,
          created_at: new Date().toISOString(),
        };
        localTicketTypes.push(newType);
        return { data: { success: true, message: 'Ticket type created', data: { ticket_type: newType } } };
      }
      throw error;
    }
  },

  // PUT /tickets/types/:id
  updateType: async (id, data) => {
    try {
      return await api.put(`/tickets/types/${id}`, data);
    } catch (error) {
      if (isBackendError(error)) {
        const index = localTicketTypes.findIndex((t) => t.id === id || t.type === id);
        if (index !== -1) {
          localTicketTypes[index] = { ...localTicketTypes[index], ...data };
          return { data: { success: true, message: 'Ticket type updated', data: { ticket_type: localTicketTypes[index] } } };
        }
      }
      throw error;
    }
  },

  // DELETE /tickets/types/:id
  deleteType: async (id) => {
    try {
      return await api.delete(`/tickets/types/${id}`);
    } catch (error) {
      if (isBackendError(error)) {
        localTicketTypes = localTicketTypes.filter((t) => t.id !== id && t.type !== id);
        return { data: { success: true, message: 'Ticket type deleted' } };
      }
      throw error;
    }
  },

  // GET /tickets/:id (Staff View Single Ticket Details)
  getTicket: async (id) => {
    try {
      return await api.get(`/tickets/${id}`);
    } catch (error) {
      if (isBackendError(error)) {
        const found = localMockTickets.find(
          (t) => t.id === id || t.qr_ticket_code === id
        );
        if (found) {
          return { data: { success: true, data: { ticket: found } } };
        }
      }
      throw error;
    }
  },

  // GET /tickets (Staff List of booked tickets)
  listTickets: async (params = {}) => {
    try {
      return await api.get('/tickets', { params });
    } catch (error) {
      if (isBackendError(error)) {
        let filtered = [...localMockTickets];
        if (params.status) {
          filtered = filtered.filter((t) => t.status === params.status);
        }
        if (params.ticket_type) {
          filtered = filtered.filter((t) => t.ticket_type === params.ticket_type);
        }
        if (params.visit_date) {
          filtered = filtered.filter((t) => t.visit_date === params.visit_date);
        }
        if (params.search) {
          const q = params.search.toLowerCase();
          filtered = filtered.filter(
            (t) =>
              t.visitor_name.toLowerCase().includes(q) ||
              t.visitor_phone.toLowerCase().includes(q) ||
              t.qr_ticket_code.toLowerCase().includes(q)
          );
        }

        return {
          data: {
            success: true,
            data: {
              tickets: filtered,
              pagination: {
                total: filtered.length,
                page: 1,
                limit: 20,
                totalPages: 1,
              },
            },
          },
        };
      }
      throw error;
    }
  },

  // POST /tickets/purchase (Public purchase or Staff issue)
  purchase: async (data) => {
    try {
      return await api.post('/tickets/purchase', data);
    } catch (error) {
      if (isBackendError(error)) {
        const ticketCode = `TKT-${Math.floor(100000 + Math.random() * 900000)}`;
        const selectedType =
          localTicketTypes.find((t) => t.type === data.ticket_type) ||
          INITIAL_TICKET_TYPES[0];
        const quantity = Number(data.quantity) || 1;
        const totalAmount = selectedType.price_etb * quantity;

        const mockTicket = {
          id: `tkt-${Date.now()}`,
          qr_ticket_code: ticketCode,
          ticket_type: selectedType.type,
          quantity,
          unit_price: selectedType.price_etb,
          total_amount: totalAmount,
          visitor_name: data.visitor_name || 'Valued Visitor',
          visitor_phone: data.visitor_phone || '+251900000000',
          visit_date: data.visit_date || new Date().toISOString().split('T')[0],
          status: 'valid',
          payment_method: data.payment_method || 'telebirr',
          payment_status: 'completed',
          created_at: new Date().toISOString(),
          qr_data_url: generateQRDataUrl(ticketCode),
        };

        localMockTickets.unshift(mockTicket);

        return {
          data: {
            success: true,
            message: 'Ticket purchased successfully',
            data: {
              ticket: mockTicket,
              payment_simulation: {
                status: 'completed',
                reference: `DEMO-${Date.now()}`,
                sandbox_mode: true,
                sandbox_label: 'DEMO MODE — Ticket processed locally',
              },
              qr_data_url: mockTicket.qr_data_url,
            },
          },
        };
      }
      throw error;
    }
  },

  // PATCH /tickets/:id (Staff update ticket)
  updateTicket: async (id, data) => {
    try {
      return await api.patch(`/tickets/${id}`, data);
    } catch (error) {
      if (isBackendError(error)) {
        const index = localMockTickets.findIndex((t) => t.id === id);
        if (index !== -1) {
          localMockTickets[index] = { ...localMockTickets[index], ...data };
          if (data.status === 'used' && !localMockTickets[index].used_at) {
            localMockTickets[index].used_at = new Date().toISOString();
          }
          return { data: { success: true, message: 'Ticket updated', data: { ticket: localMockTickets[index] } } };
        }
      }
      throw error;
    }
  },

  // DELETE /tickets/:id (Staff cancel/delete ticket)
  deleteTicket: async (id) => {
    try {
      return await api.delete(`/tickets/${id}`);
    } catch (error) {
      if (isBackendError(error)) {
        localMockTickets = localMockTickets.filter((t) => t.id !== id);
        return { data: { success: true, message: 'Ticket deleted' } };
      }
      throw error;
    }
  },

  // GET /tickets/verify/:code
  verify: async (code) => {
    try {
      return await api.get(`/tickets/verify/${code}`);
    } catch (error) {
      const status = error.response?.status;
      if (status === 401 || isBackendError(error)) {
        const cleanCode = String(code || '').trim().toUpperCase();
        const found = localMockTickets.find((t) => t.qr_ticket_code === cleanCode);

        if (!found) {
          return {
            data: {
              success: true,
              data: {
                valid: false,
                ticket: null,
                message: 'Invalid Code',
              },
            },
          };
        }

        if (found.status === 'used') {
          return {
            data: {
              success: true,
              data: {
                valid: false,
                ticket: found,
                message: 'Already Used',
              },
            },
          };
        }

        found.status = 'used';
        found.used_at = new Date().toISOString();

        return {
          data: {
            success: true,
            data: {
              valid: true,
              ticket: found,
              message: 'Valid Pass',
            },
          },
        };
      }
      throw error;
    }
  },
};

export default ticketApi;
