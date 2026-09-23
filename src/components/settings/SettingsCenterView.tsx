import React, { useState } from 'react';
import { useServOS } from '../../context/ServOSContext';
import { 
  Settings, 
  Building, 
  ShieldCheck, 
  Sliders, 
  Printer, 
  Smartphone, 
  FileText, 
  Save, 
  CheckCircle2, 
  Check, 
  X, 
  Lock, 
  Server, 
  Globe, 
  Layers,
  Sparkles,
  Key,
  Users
} from 'lucide-react';

export const SettingsCenterView: React.FC = () => {
  const { currentProperty, currentOutlet, edgeDevices, showToast } = useServOS();
  const [activeTab, setActiveTab] = useState<'PROPERTIES' | 'ROLES_PERMISSIONS' | 'FISCAL_ETIMS' | 'PAYMENT_GATEWAYS' | 'PRINTERS_KDS'>('PROPERTIES');

  // Role permissions matrix state
  const [permissionsMatrix, setPermissionsMatrix] = useState({
    server: {
      createOrder: true,
      modifyOrder: true,
      sendKds: true,
      acceptMpesa: true,
      acceptCash: true,
      processRefund: false,
      applyDiscountMax5: true,
      applyDiscountOver5: false,
      adjustStock: false,
      viewAccounting: false
    },
    manager: {
      createOrder: true,
      modifyOrder: true,
      sendKds: true,
      acceptMpesa: true,
      acceptCash: true,
      processRefund: true,
      applyDiscountMax5: true,
      applyDiscountOver5: true,
      adjustStock: true,
      viewAccounting: true
    },
    admin: {
      createOrder: true,
      modifyOrder: true,
      sendKds: true,
      acceptMpesa: true,
      acceptCash: true,
      processRefund: true,
      applyDiscountMax5: true,
      applyDiscountOver5: true,
      adjustStock: true,
      viewAccounting: true
    }
  });

  const toggleServerPerm = (key: keyof typeof permissionsMatrix.server) => {
    setPermissionsMatrix(prev => ({
      ...prev,
      server: {
        ...prev.server,
        [key]: !prev.server[key]
      }
    }));
  };

  const handleSaveSettings = () => {
    showToast('Property settings & role matrix updated across all edge nodes!', 'success');
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 text-slate-100 overflow-hidden">
      {/* Top Header */}
      <div className="p-4 sm:p-5 bg-slate-900 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-mono text-[10px] font-bold tracking-wider uppercase border border-slate-700">
              SYSTEM CONFIGURATION
            </span>
            <span className="text-slate-400 text-xs font-mono">Multi-Property & Edge Infrastructure</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1 flex items-center gap-2">
            <span>Settings & Organization Hub</span>
          </h1>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center bg-slate-850 p-1 rounded-xl border border-slate-750 text-xs font-mono overflow-x-auto">
          <button
            onClick={() => setActiveTab('PROPERTIES')}
            className={`px-3 py-1.5 rounded-lg transition-colors font-bold whitespace-nowrap ${
              activeTab === 'PROPERTIES' ? 'bg-slate-750 text-amber-300 shadow-xs' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Properties & Outlets
          </button>
          <button
            onClick={() => setActiveTab('ROLES_PERMISSIONS')}
            className={`px-3 py-1.5 rounded-lg transition-colors font-bold whitespace-nowrap ${
              activeTab === 'ROLES_PERMISSIONS' ? 'bg-slate-750 text-amber-300 shadow-xs' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            RBAC & Roles
          </button>
          <button
            onClick={() => setActiveTab('FISCAL_ETIMS')}
            className={`px-3 py-1.5 rounded-lg transition-colors font-bold whitespace-nowrap ${
              activeTab === 'FISCAL_ETIMS' ? 'bg-slate-750 text-amber-300 shadow-xs' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            eTIMS & Taxes
          </button>
          <button
            onClick={() => setActiveTab('PAYMENT_GATEWAYS')}
            className={`px-3 py-1.5 rounded-lg transition-colors font-bold whitespace-nowrap ${
              activeTab === 'PAYMENT_GATEWAYS' ? 'bg-slate-750 text-amber-300 shadow-xs' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            M-PESA Daraja
          </button>
        </div>
      </div>

      {/* Main Settings Content */}
      {activeTab === 'PROPERTIES' && (
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Building className="w-5 h-5 text-amber-400" />
                <span>Multi-Property Organization Hierarchy</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Grand Hospitality Holdings Ltd • Code: GHH-KE</p>
            </div>

            <button
              onClick={handleSaveSettings}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                name: 'Grand Nairobi Hotel & Resort',
                code: 'PROP-01',
                city: 'Nairobi CBD',
                outlets: ['Main Cocktail Bar', 'Terrace Grill', 'Hotel Front Desk', 'Executive VIP Lounge'],
                status: 'PRIMARY ACTIVE'
              },
              {
                name: 'Westlands Sky Lounge',
                code: 'PROP-02',
                city: 'Westlands, Nairobi',
                outlets: ['Rooftop Cocktail Bar', 'Tapas Kitchen', 'VIP Arena'],
                status: 'ACTIVE'
              },
              {
                name: 'Mombasa Beachfront Resort',
                code: 'PROP-03',
                city: 'Nyali, Mombasa',
                outlets: ['Poolside Tiki Bar', 'Seafood Grill', 'Ocean Suites'],
                status: 'ACTIVE'
              }
            ].map((prop, idx) => (
              <div key={idx} className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                    {prop.code}
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold">{prop.status}</span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-white">{prop.name}</h3>
                  <p className="text-xs text-slate-400">{prop.city}</p>
                </div>

                <div className="space-y-1 text-xs font-mono text-slate-300 pt-2 border-t border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase block">Configured Outlets:</span>
                  {prop.outlets.map((o, oIdx) => (
                    <div key={oIdx} className="flex items-center gap-1.5 text-[11px]">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                      <span>{o}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ROLES & PERMISSIONS TAB */}
      {activeTab === 'ROLES_PERMISSIONS' && (
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-purple-400" />
                <span>Role & Permission Security Matrix (RBAC)</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Define operational authorities for servers, cashiers, supervisors & administrators</p>
            </div>

            <button
              onClick={handleSaveSettings}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>Apply RBAC Rules</span>
            </button>
          </div>

          <div className="overflow-x-auto border border-slate-800 rounded-2xl bg-slate-900">
            <table className="w-full text-left text-xs font-mono border-collapse">
              <thead>
                <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase font-bold">
                  <th className="p-3.5">Permission Capability</th>
                  <th className="p-3.5 text-center">Server / Bartender</th>
                  <th className="p-3.5 text-center">Operations Manager</th>
                  <th className="p-3.5 text-center">Executive Admin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {[
                  { key: 'createOrder', label: 'Create & Send POS Order Tickets' },
                  { key: 'modifyOrder', label: 'Modify Open Check Items' },
                  { key: 'acceptMpesa', label: 'Trigger M-PESA STK Push' },
                  { key: 'acceptCash', label: 'Accept Cash & Open Drawer' },
                  { key: 'processRefund', label: 'Issue Itemized Refund / Credit Note' },
                  { key: 'applyDiscountMax5', label: 'Apply Discount <= 5%' },
                  { key: 'applyDiscountOver5', label: 'Override Discount > 5% / VIP Comp' },
                  { key: 'adjustStock', label: 'Perform Stock Variance Adjustment' },
                  { key: 'viewAccounting', label: 'Access Double-Entry Journal & P&L' }
                ].map(item => {
                  const sVal = permissionsMatrix.server[item.key as keyof typeof permissionsMatrix.server];
                  const mVal = permissionsMatrix.manager[item.key as keyof typeof permissionsMatrix.manager];
                  const aVal = permissionsMatrix.admin[item.key as keyof typeof permissionsMatrix.admin];

                  return (
                    <tr key={item.key} className="hover:bg-slate-850/50">
                      <td className="p-3.5 font-bold text-white">{item.label}</td>

                      {/* Server Toggle */}
                      <td className="p-3.5 text-center">
                        <button
                          onClick={() => toggleServerPerm(item.key as any)}
                          className={`w-6 h-6 rounded-md border inline-flex items-center justify-center transition-colors ${
                            sVal ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300' : 'bg-slate-800 border-slate-700 text-slate-500'
                          }`}
                        >
                          {sVal ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                        </button>
                      </td>

                      {/* Manager */}
                      <td className="p-3.5 text-center">
                        <span className="w-6 h-6 rounded-md bg-emerald-500/20 border border-emerald-500 text-emerald-300 inline-flex items-center justify-center">
                          <Check className="w-4 h-4" />
                        </span>
                      </td>

                      {/* Admin */}
                      <td className="p-3.5 text-center">
                        <span className="w-6 h-6 rounded-md bg-emerald-500/20 border border-emerald-500 text-emerald-300 inline-flex items-center justify-center">
                          <Check className="w-4 h-4" />
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ETIMS & TAXES */}
      {activeTab === 'FISCAL_ETIMS' && (
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-amber-400" />
              <span>Kenya Revenue Authority (KRA) eTIMS Parameters</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
              <div className="p-3.5 bg-slate-850 border border-slate-750 rounded-xl space-y-1">
                <span className="text-slate-400 block">KRA Taxpayer PIN:</span>
                <span className="text-amber-400 font-bold text-sm">P051239841Z</span>
              </div>
              <div className="p-3.5 bg-slate-850 border border-slate-750 rounded-xl space-y-1">
                <span className="text-slate-400 block">eTIMS OSCU Control Unit Serial:</span>
                <span className="text-emerald-400 font-bold text-sm">KRA-OSCU-99418240</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PAYMENT GATEWAYS */}
      {activeTab === 'PAYMENT_GATEWAYS' && (
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-emerald-400" />
              <span>Safaricom M-PESA Daraja 3.0 API Integration</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
              <div className="p-3.5 bg-slate-850 border border-slate-750 rounded-xl space-y-1">
                <span className="text-slate-400 block">Till / Paybill Number:</span>
                <span className="text-white font-bold text-sm">684920</span>
              </div>
              <div className="p-3.5 bg-slate-850 border border-slate-750 rounded-xl space-y-1">
                <span className="text-slate-400 block">STK Push Timeout:</span>
                <span className="text-amber-300 font-bold text-sm">45 Seconds</span>
              </div>
              <div className="p-3.5 bg-slate-850 border border-slate-750 rounded-xl space-y-1">
                <span className="text-slate-400 block">B2C Commission Float:</span>
                <span className="text-emerald-400 font-bold text-sm">KES 450,000</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
