'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { LayoutDashboard, FileText, MessageSquare } from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Reviews', href: '/reviews', icon: FileText },
  { name: 'AI Chat', href: '/chat', icon: MessageSquare },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 bg-dark-sidebar border-r border-dark-border flex flex-col">
      <div className="p-6 border-b border-dark-border">
        <h2 className="text-xl font-bold text-gray-100">Nimbus</h2>
        <p className="text-sm text-gray-400 font-medium mt-1">AI Sentiment Intelligence</p>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-accent-blue/20 to-accent-blue/10 text-accent-blue font-medium border border-accent-blue/30 glow-blue'
                  : 'text-gray-300 hover:bg-dark-card hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

