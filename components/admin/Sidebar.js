'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiHome, FiPlus, FiSettings, FiLogOut } from 'react-icons/fi';

export default function AdminSidebar() {
  const pathname = usePathname();

  const navItems = [
    { href: '/admin', icon: <FiHome />, text: 'Dashboard' },
    { href: '/admin/cars', icon: <FiPlus />, text: 'Manage Cars' },
    { href: '/admin/settings', icon: <FiSettings />, text: 'Settings' },
  ];

  return (
    <aside className="fixed h-full w-64 bg-white shadow-lg p-4">
      <div className="mb-8 p-2">
        <h1 className="text-xl font-bold text-gray-800">Dealership Admin</h1>
      </div>
      
      <nav className="space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center p-3 rounded-lg transition-colors ${
              pathname === item.href
                ? 'bg-blue-100 text-blue-600'
                : 'hover:bg-gray-100 text-gray-700'
            }`}
          >
            <span className="mr-3">{item.icon}</span>
            {item.text}
          </Link>
        ))}
      </nav>

      <div className="mt-auto border-t pt-4">
        <button className="w-full flex items-center p-3 text-red-600 hover:bg-red-50 rounded-lg">
          <FiLogOut className="mr-3" />
          Logout
        </button>
      </div>
    </aside>
  );
}