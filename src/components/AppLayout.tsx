'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ScanLine, Refrigerator, ChefHat, ShoppingBag, Leaf } from 'lucide-react';

const NAV_ITEMS = [
  { name: 'Scan', path: '/', icon: ScanLine },
  { name: 'Fridge', path: '/fridge', icon: Refrigerator },
  { name: 'Recipes', path: '/recipes', icon: ChefHat },
  { name: 'Cart', path: '/checkout', icon: ShoppingBag },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-transparent text-gray-900 flex flex-col md:flex-row selection:bg-emerald-500/20 font-sans">
      
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white/80 backdrop-blur-xl border-r border-gray-200/60 px-6 py-8 shadow-sm z-10">
        <div className="flex items-center space-x-3 mb-12 px-2">
          <div className="p-2.5 bg-gradient-to-br from-emerald-100 to-teal-50 rounded-2xl shadow-sm border border-emerald-100">
            <Leaf className="w-6 h-6 text-emerald-600" />
          </div>
          <span className="text-2xl font-extrabold tracking-tight text-gray-900">Cookify</span>
        </div>
        
        <nav className="flex-1 space-y-2">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.path;
            const Icon = item.icon;
            return (
              <Link 
                key={item.path} 
                href={item.path}
                className={`group flex items-center space-x-3 px-4 py-3.5 rounded-2xl transition-all duration-300 ${
                  isActive 
                    ? 'bg-emerald-50 text-emerald-700 font-bold shadow-sm ring-1 ring-emerald-500/10' 
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? 'text-emerald-600 scale-110' : 'group-hover:scale-110'}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto pt-8 border-t border-gray-100">
          <div className="flex items-center space-x-3 px-2 hover:bg-gray-50 p-2 rounded-2xl transition-colors cursor-pointer">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white font-bold shadow-md">
              A
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">Almas S.</p>
              <p className="text-xs text-gray-500 font-medium">Premium Plan</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-8 pb-28 md:pb-8 relative">
        <div className="max-w-5xl mx-auto w-full h-full flex flex-col">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-gray-200 pb-safe z-50 shadow-[0_-8px_30px_-15px_rgba(0,0,0,0.1)]">
        <div className="flex justify-around items-center p-2">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.path;
            const Icon = item.icon;
            return (
              <Link 
                key={item.path} 
                href={item.path}
                className={`relative flex flex-col items-center justify-center w-16 h-14 space-y-1 rounded-2xl transition-all duration-300 ${
                  isActive ? 'text-emerald-600' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <Icon className={`w-5 h-5 transition-all duration-300 ${isActive ? 'scale-110 mb-0.5' : ''}`} />
                <span className={`text-[10px] font-semibold tracking-wide transition-all ${isActive ? 'opacity-100' : 'opacity-70'}`}>
                  {item.name}
                </span>
                {isActive && (
                  <div className="absolute -bottom-1 w-1 h-1 rounded-full bg-emerald-500" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}