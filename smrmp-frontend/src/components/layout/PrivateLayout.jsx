import Sidebar from './Sidebar';
import Navbar from './Navbar';

export default function PrivateLayout({ children }) {
  return (
    <div className="admin-shell flex min-h-screen bg-smrmp-parchment text-[#2B1B12] font-sans">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
