import { Outlet } from 'react-router-dom';
import VisitorSidebar from './VisitorSidebar';
import VisitorNavbar from './VisitorNavbar';

/**
 * Authenticated Visitor Portal shell.
 * Architecture mirrors Admin (sidebar + header + scrollable main)
 * with a visitor-specific dark/gold identity.
 */
export default function VisitorLayout({ children }) {
  const content = children ?? <Outlet />;

  return (
    <div className="visitor-shell flex h-dvh overflow-hidden bg-smrmp-parchment font-sans text-[#2B1B12]">
      <VisitorSidebar />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <VisitorNavbar />
        <div className="min-h-0 flex-1 overflow-y-auto">
          <main className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-7">
            {content}
          </main>
        </div>
      </div>
    </div>
  );
}
