import { MUSEUM_NAME } from '../utils/constants';

export const TELEBIRR_SESSION_KEY = 'smrmp_telebirr_checkout';
export const TELEBIRR_RESULT_KEY = 'smrmp_telebirr_result';

export function buildTelebirrCheckoutSession({
  amount,
  phone,
  visitor_name,
  ticket_type,
  quantity,
  visit_date,
  merchantName = MUSEUM_NAME,
}) {
  return {
    amount,
    phone,
    visitor_name,
    ticket_type,
    quantity,
    visit_date,
    merchantName,
    subject: `Museum Ticket — ${String(ticket_type || 'pass').replace(/_/g, ' ')} × ${quantity}`,
    outTradeNo: `TKT${Date.now()}${Math.floor(Math.random() * 900 + 100)}`,
    createdAt: new Date().toISOString(),
  };
}
