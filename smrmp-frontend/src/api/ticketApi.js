import api from './axios';
import { isBackendError, generateQRDataUrl } from './mockStore';

export const TICKET_TYPES = [
  { type: 'adult', label: 'Adult Admission', price_etb: 150, description: 'Standard entry for local & international adult visitors' },
  { type: 'student', label: 'Student / Youth', price_etb: 50, description: 'Discounted entry with valid student or school ID' },
  { type: 'vip', label: 'VIP Guided Tour', price_etb: 500, description: 'All-access exhibition entry + dedicated curator guided tour' },
  { type: 'group', label: 'School / Delegations', price_etb: 300, description: 'Group package for up to 10 school or official visitors' },
];

export const ticketApi = {
  getTypes: async () => {
    try {
      return await api.get('/tickets/types');
    } catch (error) {
      if (isBackendError(error)) {
        return { data: { success: true, ticket_types: TICKET_TYPES } };
      }
      throw error;
    }
  },

  purchase: async (data) => {
    try {
      return await api.post('/tickets/purchase', data);
    } catch (error) {
      if (isBackendError(error)) {
        const ticketCode = `TKT-${Math.floor(100000 + Math.random() * 900000)}`;
        const selectedType = TICKET_TYPES.find((t) => t.type === data.ticket_type) || TICKET_TYPES[0];
        const quantity = data.quantity || 1;
        const totalAmount = selectedType.price_etb * quantity;

        const mockTicket = {
          id: `tkt-${Date.now()}`,
          qr_ticket_code: ticketCode,
          ticket_type: selectedType.label,
          quantity,
          total_amount: totalAmount,
          visitor_name: data.visitor_name || 'Valued Visitor',
          visit_date: data.visit_date || new Date().toISOString().split('T')[0],
          status: 'valid',
          payment_method: data.payment_method || 'telebirr',
          qr_data_url: generateQRDataUrl(ticketCode),
        };

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
            },
          },
        };
      }
      throw error;
    }
  },

  verify: async (code) => {
    try {
      return await api.get(`/tickets/verify/${code}`);
    } catch (error) {
      if (isBackendError(error)) {
        return {
          data: {
            success: true,
            valid: true,
            ticket: {
              qr_ticket_code: code,
              visitor_name: 'Adwa Visitor',
              ticket_type: 'Adult Admission',
              status: 'valid',
              quantity: 1,
            },
            message: 'Valid Entry Ticket',
          },
        };
      }
      throw error;
    }
  },
};

export default ticketApi;
