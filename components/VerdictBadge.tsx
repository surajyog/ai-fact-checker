import React from 'react';
import { VerdictType } from '../types';
import { CheckCircle, XCircle, AlertTriangle, HelpCircle, Info } from 'lucide-react';

interface VerdictBadgeProps {
  verdict: VerdictType;
  size?: 'sm' | 'lg';
}

const VerdictBadge: React.FC<VerdictBadgeProps> = ({ verdict, size = 'lg' }) => {
  let colorClass = '';
  let Icon = HelpCircle;
  let label = '';

  switch (verdict) {
    case VerdictType.TRUE:
      colorClass = 'bg-emerald-600 text-white border-emerald-700 shadow-md shadow-emerald-200';
      Icon = CheckCircle;
      label = 'Verified True';
      break;
    case VerdictType.FALSE:
      colorClass = 'bg-red-600 text-white border-red-700 shadow-md shadow-red-200';
      Icon = XCircle;
      label = 'False Information';
      break;
    case VerdictType.MISLEADING:
      colorClass = 'bg-orange-500 text-white border-orange-600 shadow-md shadow-orange-200';
      Icon = AlertTriangle;
      label = 'Misleading';
      break;
    case VerdictType.COMPLEX:
      colorClass = 'bg-blue-600 text-white border-blue-700 shadow-md shadow-blue-200';
      Icon = Info;
      label = 'Complex / Nuanced';
      break;
    default:
      colorClass = 'bg-slate-500 text-white border-slate-600 shadow-sm';
      Icon = HelpCircle;
      label = 'Unverified';
      break;
  }

  const sizeClasses = size === 'lg' 
    ? 'px-6 py-3 text-lg font-bold rounded-xl border-b-4' 
    : 'px-3 py-1 text-xs font-bold rounded-lg border-b-2';

  return (
    <div className={`inline-flex items-center gap-2 ${sizeClasses} ${colorClass} transition-transform hover:-translate-y-0.5`}>
      <Icon size={size === 'lg' ? 24 : 14} strokeWidth={2.5} />
      <span className="tracking-wide">{label}</span>
    </div>
  );
};

export default VerdictBadge;