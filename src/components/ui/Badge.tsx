import React, { ReactNode } from 'react';
import { cn } from '../../utils/cn';

interface BadgeProps {
  children: ReactNode;
  variant?: 'blue' | 'gray' | 'green';
  className?: string;
}

export function Badge({ children, variant = 'gray', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border transition-colors',
        variant === 'blue' && 'bg-blue-50 text-blue-700 border-blue-200',
        variant === 'gray' && 'bg-gray-50 text-gray-600 border-gray-200',
        variant === 'green' && 'bg-emerald-50 text-emerald-700 border-emerald-200',
        className
      )}
    >
      {children}
    </span>
  );
}
