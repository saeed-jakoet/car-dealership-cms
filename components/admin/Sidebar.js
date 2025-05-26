'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import {
    FiHome,
    FiPlus,
    FiSettings,
    FiLogOut,
    FiStar,
    FiInbox
} from 'react-icons/fi';

export default function AdminSidebar() {
    const pathname = usePathname();

    const navItems = [
        { href: '/admin', icon: <FiHome />, text: 'Dashboard' },
        { href: '/admin/inbox', icon: <FiInbox />, text: 'Inbox' },
        { href: '/admin/reviews', icon: <FiStar />, text: 'Manage Reviews' },
        { href: '/admin/settings', icon: <FiSettings />, text: 'Settings' },
    ];

    return (
        <aside className="fixed top-4 left-4 bottom-4 w-64 rounded-3xl bg-white/80 backdrop-blur-md border border-gray-200 shadow-xl flex flex-col overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200 flex items-center gap-2">
                <Image
                    src="/logo3.png"
                    alt="Farauto Logo"
                    width={32}
                    height={32}
                    className="rounded"
                    priority
                />
                <h1 className="text-xl font-extrabold text-gray-800 tracking-tight">
                    Farauto Admin
                </h1>
            </div>

            <nav className="flex-1 overflow-y-auto px-3 py-5 space-y-1">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200
                ${
                                isActive
                                    ? 'bg-blue-600 text-white shadow-sm'
                                    : 'text-gray-700 hover:bg-gray-100'
                            }`}
                        >
                            <span className="text-lg">{item.icon}</span>
                            <span className="text-sm tracking-wide">{item.text}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="px-4 py-4 border-t border-gray-100">
                <button
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
                >
                    <FiLogOut className="text-base" />
                    Logout
                </button>
            </div>
        </aside>
    );
}