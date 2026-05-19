'use client';

import React from 'react';
import { AlertTriangle, Clock, ShieldCheck, Beef, Carrot, Milk, AlertCircle } from 'lucide-react';

const MOCK_INVENTORY = [
  { id: 1, name: 'Fresh Beef', quantity: '500g', category: 'meat', status: 'High', daysLeft: 4 },
  { id: 2, name: 'Yellow Onions', quantity: '3 ea', category: 'veg', status: 'Normal', daysLeft: 12 },
  { id: 3, name: 'Whole Milk', quantity: '1L', category: 'dairy', status: 'Expires Soon', daysLeft: 1 },
  { id: 4, name: 'White Mushrooms', quantity: '200g', category: 'veg', status: 'Normal', daysLeft: 5 },
];

export default function DigitalFridgePage() {
  
  const getStatusBadge = (status: string, daysLeft: number) => {
    if (status === 'Expires Soon' || daysLeft <= 2) {
      return (
        <span className="inline-flex items-center px-3 py-1.5 bg-red-50 text-red-700 text-xs font-bold rounded-xl border border-red-100 shadow-sm">
          <AlertTriangle className="w-3.5 h-3.5 mr-1.5" />
          Spoils in {daysLeft}d
        </span>
      );
    }
    if (status === 'High' || daysLeft <= 5) {
      return (
        <span className="inline-flex items-center px-3 py-1.5 bg-orange-50 text-orange-700 text-xs font-bold rounded-xl border border-orange-100 shadow-sm">
          <Clock className="w-3.5 h-3.5 mr-1.5" />
          Use within {daysLeft}d
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-xl border border-emerald-100 shadow-sm">
        <ShieldCheck className="w-3.5 h-3.5 mr-1.5" />
        Fresh
      </span>
    );
  };

  const getIcon = (category: string) => {
    switch(category) {
      case 'meat': return <Beef className="w-5 h-5 text-rose-500" />;
      case 'dairy': return <Milk className="w-5 h-5 text-blue-500" />;
      default: return <Carrot className="w-5 h-5 text-orange-500" />;
    }
  };

  const expiringItemsCount = MOCK_INVENTORY.filter(i => i.daysLeft <= 2).length;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 pt-4">
      <header className="mb-10">
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight mb-3">My Digital Fridge</h1>
        <p className="text-sm text-gray-500 font-medium">Total ingredients: <span className="font-bold text-gray-700">{MOCK_INVENTORY.length}</span></p>
      </header>

      {/* Emotional Rescue Alert */}
      {expiringItemsCount > 0 && (
        <div className="mb-10 p-5 bg-gradient-to-r from-red-50 to-orange-50 border border-red-100 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between shadow-sm gap-4">
          <div className="flex items-center">
            <div className="p-3 bg-white rounded-2xl mr-4 shadow-sm border border-red-50">
              <AlertCircle className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-red-950">Rescue Mission!</h3>
              <p className="text-sm text-red-800 mt-0.5 font-medium">{expiringItemsCount} ingredients are about to spoil.</p>
            </div>
          </div>
          <button className="text-sm font-bold text-white bg-red-500 hover:bg-red-600 transition-all duration-300 px-6 py-3 rounded-xl shadow-lg shadow-red-500/20 active:scale-[0.98] w-full sm:w-auto">
            Cook them now
          </button>
        </div>
      )}

      {/* Inventory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {MOCK_INVENTORY.map((item, idx) => (
          <div 
            key={item.id} 
            className="flex items-center justify-between p-5 bg-white border border-gray-100 rounded-3xl hover:shadow-lg hover:shadow-emerald-500/5 hover:border-emerald-100 transition-all duration-300 group animate-in slide-in-from-bottom-4 fade-in"
            style={{ animationDelay: `${idx * 100}ms`, animationFillMode: 'both' }}
          >
            <div className="flex items-center space-x-5">
              <div className="p-3.5 bg-gray-50 rounded-2xl group-hover:bg-emerald-50 transition-colors duration-300 border border-transparent group-hover:border-emerald-100/50">
                {getIcon(item.category)}
              </div>
              <div>
                <span className="block text-base font-extrabold text-gray-900">{item.name}</span>
                <span className="block text-sm text-gray-500 mt-1 font-medium">{item.quantity}</span>
              </div>
            </div>
            
            <div className="flex flex-col items-end">
              {getStatusBadge(item.status, item.daysLeft)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}