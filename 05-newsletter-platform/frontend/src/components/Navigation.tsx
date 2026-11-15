'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Mail, Users, FileText, BarChart3, ExternalLink, Send } from 'lucide-react';

export default function Navigation() {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'Dashboard', icon: BarChart3 },
    { href: '/campaigns', label: 'Campaigns', icon: Mail },
    { href: '/subscribers', label: 'Subscribers', icon: Users },
    { href: '/campaigns/new', label: 'New Campaign', icon: Send },
  ];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-9 h-9 rounded-lg bg-sky-600 flex items-center justify-center text-white font-bold shadow-sm">
                P
              </div>
              <div>
                <span className="text-lg font-bold text-slate-900 tracking-tight">Pixlo</span>
                <span className="text-xs ml-1.5 px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 font-semibold border border-sky-200">
                  Broadcast
                </span>
              </div>
            </Link>

            <nav className="hidden md:flex space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center space-x-2 px-3.5 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-sky-50 text-sky-700 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              href="/p/weekly-disruption"
              target="_blank"
              className="flex items-center space-x-1.5 text-xs text-slate-500 hover:text-slate-900 px-3 py-1.5 rounded-md border border-slate-200 bg-slate-50 transition-colors"
            >
              <span>Public Page</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>

            <div className="flex items-center space-x-2 pl-3 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center text-xs font-medium">
                SP
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-semibold text-slate-800">Sarah Publisher</p>
                <p className="text-[11px] text-slate-500">The Weekly Disruption</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
