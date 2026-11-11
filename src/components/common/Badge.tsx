import React from 'react';
import { AulaStatus } from '../../types';
import { CheckCircle2, Clock, AlertTriangle, ArrowRightLeft, XCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: AulaStatus;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const isSm = size === 'sm';

  switch (status) {
    case 'realizada':
      return (
        <span
          className={`inline-flex items-center gap-1 font-medium rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 ${
            isSm ? 'px-1.5 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
          }`}
        >
          <CheckCircle2 className={isSm ? 'w-2.5 h-2.5' : 'w-3.5 h-3.5 text-emerald-600'} />
          <span>Realizada</span>
        </span>
      );

    case 'prejudicada':
      return (
        <span
          className={`inline-flex items-center gap-1 font-semibold rounded-full bg-amber-50 text-amber-800 border border-amber-300 animate-pulse ${
            isSm ? 'px-1.5 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
          }`}
          title="Aula teve prejuízo / interrupção operacional"
        >
          <AlertTriangle className={isSm ? 'w-2.5 h-2.5 text-amber-600' : 'w-3.5 h-3.5 text-amber-600'} />
          <span>Prejudicada</span>
        </span>
      );

    case 'remanejada':
      return (
        <span
          className={`inline-flex items-center gap-1 font-medium rounded-full bg-purple-50 text-purple-700 border border-purple-200 ${
            isSm ? 'px-1.5 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
          }`}
        >
          <ArrowRightLeft className={isSm ? 'w-2.5 h-2.5' : 'w-3.5 h-3.5 text-purple-600'} />
          <span>Remanejada</span>
        </span>
      );

    case 'cancelada':
      return (
        <span
          className={`inline-flex items-center gap-1 font-medium rounded-full bg-rose-50 text-rose-700 border border-rose-200 ${
            isSm ? 'px-1.5 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
          }`}
        >
          <XCircle className={isSm ? 'w-2.5 h-2.5' : 'w-3.5 h-3.5 text-rose-600'} />
          <span>Cancelada</span>
        </span>
      );

    case 'agendada':
    default:
      return (
        <span
          className={`inline-flex items-center gap-1 font-medium rounded-full bg-blue-50 text-blue-700 border border-blue-200 ${
            isSm ? 'px-1.5 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
          }`}
        >
          <Clock className={isSm ? 'w-2.5 h-2.5' : 'w-3.5 h-3.5 text-blue-600'} />
          <span>Agendada</span>
        </span>
      );
  }
};

