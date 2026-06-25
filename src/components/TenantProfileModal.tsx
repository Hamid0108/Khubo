import React from 'react';
import { X, Users, Mail, Phone, Calendar, Shield, ShieldAlert, ShieldCheck } from 'lucide-react';
import { TenantInfo } from '../types';

interface TenantProfileModalProps {
  tenants: TenantInfo[];
  isOpen: boolean;
  onClose: () => void;
}

export default function TenantProfileModal({ tenants, isOpen, onClose }: TenantProfileModalProps) {
  if (!tenants.length || !isOpen) return null;

  const statusColors: Record<string, string> = {
    active: 'bg-green-100 text-green-700',
    leaving: 'bg-yellow-100 text-yellow-700',
    moved_out: 'bg-red-100 text-red-700',
  };

  const paymentColors: Record<string, string> = {
    paid: 'bg-green-100 text-green-700',
    pending: 'bg-orange-100 text-orange-700',
    overdue: 'bg-red-100 text-red-700',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md bg-white rounded-[2rem] overflow-hidden shadow-2xl max-h-[80vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#17294F] flex items-center justify-center">
              <Users size={18} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-black text-neutral-900">Tenants</h2>
              <p className="text-xs font-medium text-neutral-400">{tenants.length} occupant{tenants.length > 1 ? 's' : ''}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-100 rounded-full transition-colors text-neutral-500 hover:text-neutral-900"
          >
            <X size={20} />
          </button>
        </div>

        {/* Divider */}
        <div className="h-px bg-neutral-100 mx-6" />

        {/* Tenant list */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
          {tenants.map((tenant) => (
            <div key={tenant.id} className="flex items-center gap-4 p-4 bg-neutral-50 rounded-2xl hover:bg-neutral-100 transition-colors">
              {/* Avatar */}
              <img
                src={tenant.image}
                alt={tenant.name}
                className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-sm shrink-0"
              />

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-neutral-900 truncate">{tenant.name}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${statusColors[tenant.status] || 'bg-neutral-100 text-neutral-600'}`}>
                    {tenant.status === 'active' && <ShieldCheck size={10} className="inline mr-0.5" />}
                    {tenant.status === 'leaving' && <ShieldAlert size={10} className="inline mr-0.5" />}
                    {tenant.status === 'moved_out' && <Shield size={10} className="inline mr-0.5" />}
                    {tenant.status.replace('_', ' ')}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${paymentColors[tenant.paymentStatus] || 'bg-neutral-100 text-neutral-600'}`}>
                    {tenant.paymentStatus === 'paid' ? 'Paid' : tenant.paymentStatus === 'pending' ? 'Pending' : 'Overdue'}
                  </span>
                </div>
                <p className="text-[11px] text-neutral-400 mt-1.5 flex items-center gap-1 truncate">
                  <Mail size={10} className="shrink-0" />
                  {tenant.email}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
