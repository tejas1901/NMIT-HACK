import React from 'react';
import { Lock } from 'lucide-react';

interface AdminBadgeProps {
  className?: string;
  label?: string;
}

export const AdminBadge: React.FC<AdminBadgeProps> = ({ 
  className = '', 
  label = 'ADMIN' 
}) => {
  return (
    <span 
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold tracking-wider uppercase bg-[#08193A] text-[#A7F3D0] border border-[#34D399]/40 shadow-xs cursor-help select-none ${className}`}
      title="Visible to admins only"
      aria-label="Visible to admins only"
    >
      <Lock className="w-2.5 h-2.5 text-[#34D399]" />
      <span>{label}</span>
    </span>
  );
};
