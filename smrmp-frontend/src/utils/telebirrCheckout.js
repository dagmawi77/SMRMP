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
  booking_type = 'individual',
  group_data = null,
}) {
  const isGroup = booking_type === 'group';
  const groupName = group_data?.group_name || 'Group';
  const visitorCount = group_data?.visitor_count || 0;

  return {
    amount,
    phone,
    visitor_name,
    ticket_type,
    quantity,
    visit_date,
    booking_type,
    group_data,
    merchantName,
    subject: isGroup
      ? `Group Visit Pass — ${groupName} (${visitorCount} visitors)`
      : `Museum Ticket — ${String(ticket_type || 'pass').replace(/_/g, ' ')} × ${quantity}`,
    outTradeNo: `${isGroup ? 'GRP' : 'TKT'}${Date.now()}${Math.floor(Math.random() * 900 + 100)}`,
    createdAt: new Date().toISOString(),
  };
}
