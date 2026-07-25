import { useLocation } from 'react-router-dom';

/** True when the page is rendered inside the persistent VisitorLayout. */
export default function usePortalEmbed() {
  const { pathname } = useLocation();
  return pathname === '/portal' || pathname.startsWith('/portal/');
}
