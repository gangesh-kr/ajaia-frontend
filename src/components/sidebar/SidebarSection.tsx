'use client';

import React, { useState, ReactNode } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface SidebarSectionProps {
  title: string;
  count?: number;
  children: ReactNode;
}

export function SidebarSection({ title, count, children }: SidebarSectionProps) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="flex flex-col">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-4 py-2 text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
      >
        <div className="flex items-center gap-1.5">
          <span>{title}</span>
          {count !== undefined && (
            <span className="flex items-center justify-center px-1.5 py-0.5 text-[10px] font-semibold text-gray-500 bg-gray-100 rounded-full min-w-[18px]">
              {count}
            </span>
          )}
        </div>
        {isOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
      </button>
      
      {isOpen && (
        <div className="mt-1 flex flex-col gap-0.5 px-2 animate-in fade-in duration-200">
          {children}
        </div>
      )}
    </div>
  );
}
