import Sidebar from './Sidebar';
import Navbar from './Navbar';

export default function PrivateLayout({ children }) {
  return (
    <div className="admin-shell flex h-dvh overflow-hidden bg-smrmp-parchment text-[#2B1B12] font-sans">
      <Sidebar />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <Navbar />
        <div className="min-h-0 flex-1 overflow-y-auto w-full">
          <main className="p-4 sm:p-6 max-w-7xl w-full mx-auto">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
