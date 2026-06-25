// @context: Tenants modal — property tenant management
// @purpose: Shows list of current tenants with room, payment status, tenancy status, contact info
// @behavior: Static mock data with status badges (Paid/Review/Pending/Draft) and tenancy status indicators
// @behavior: Each row shows client name, room number, email, payment status, and tenancy status
// @dependencies: motion, lucide-react
// @known-issues: All tenant data is static mock; no edit/action functionality

import React from 'react';

import { X } from 'lucide-react';

interface TenantsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const tenants = [
  { id: 1, client: 'North Studio', room: '101', status: 'Paid', tenancyStatus: 'Staying', email: 'billing@northstudio.co' },
  { id: 2, client: 'Atlas Works', room: '102', status: 'Review', tenancyStatus: 'Leaving', email: 'accounts@atlasworks.io' },
  { id: 3, client: 'Paper Trail', room: '201', status: 'Pending', tenancyStatus: 'Moved out', email: 'hello@papertrail.design' },
  { id: 4, client: 'Luma Team', room: '205', status: 'Paid', tenancyStatus: 'Staying', email: 'finance@luma.team' },
  { id: 5, client: 'Mono Labs', room: '302', status: 'Draft', tenancyStatus: 'Staying', email: 'ops@monolabs.dev' },
];

export function TenantsModal({ isOpen, onClose }: TenantsModalProps) {
  if (!isOpen) return null;

  return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-5xl h-[80vh] bg-white rounded-[2rem] overflow-hidden shadow-2xl z-10 flex flex-col"
        >
          <div className="flex items-center justify-between p-6 border-b border-neutral-100 shrink-0">
              <h2 className="text-xl font-bold text-neutral-900">Tenants</h2>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-neutral-100 rounded-full transition-colors text-neutral-500 hover:text-neutral-900"
              >
                <X size={20} />
              </button>
          </div>

          <div className="p-6 flex-1 overflow-y-auto">
            <div className="overflow-x-auto w-full p-1 h-full">
              <table className="w-full text-left border-collapse border-spacing-y-2">
                <thead>
                  <tr className="border-b border-neutral-100 bg-neutral-50/50">
                    <th className="p-4 pl-6 w-12 text-neutral-500 font-bold text-sm">
                      No.
                    </th>
                    <th className="p-4 text-neutral-500 font-bold text-sm">Client</th>
                    <th className="p-4 text-neutral-500 font-bold text-sm">Room No.</th>
                    <th className="p-4 text-neutral-500 font-bold text-sm">Status</th>
                    <th className="p-4 text-neutral-500 font-bold text-sm">Tenancy</th>
                    <th className="p-4 text-neutral-500 font-bold text-sm">Email</th>
                  </tr>
                </thead>
                <tbody>
                  {tenants.map((tenant, index) => (
                    <tr 
                      key={tenant.id} 
                      className={`${index !== tenants.length - 1 ? 'border-b border-neutral-50' : ''} hover:bg-neutral-50/50 transition-colors`}
                    >
                      <td className="p-4 pl-6 text-neutral-500 font-medium">
                        {index + 1}
                      </td>
                      <td className="p-4 font-bold text-[#0A2B4E] whitespace-nowrap">{tenant.client}</td>
                      <td className="p-4 text-neutral-500 font-bold">{tenant.room}</td>
                      <td className="p-4 text-neutral-500 font-medium whitespace-nowrap">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          tenant.status === 'Paid' ? 'bg-green-100 text-green-700' :
                          tenant.status === 'Review' ? 'bg-blue-100 text-blue-700' :
                          tenant.status === 'Pending' ? 'bg-orange-100 text-orange-700' :
                          'bg-neutral-100 text-neutral-600'
                        }`}>
                          {tenant.status}
                        </span>
                      </td>
                      <td className="p-4 text-neutral-500 font-medium whitespace-nowrap">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          tenant.tenancyStatus === 'Staying' ? 'bg-green-100 text-green-700' :
                          tenant.tenancyStatus === 'Leaving' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {tenant.tenancyStatus}
                        </span>
                      </td>
                      <td className="p-4 text-neutral-500 font-medium">{tenant.email}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
  );
}
