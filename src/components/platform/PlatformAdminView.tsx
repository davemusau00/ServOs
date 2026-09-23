import React, { useState } from 'react';
import { useServOS } from '../../context/ServOSContext';
import { 
  Tenant, 
  SubscriptionPlan, 
  HardwareFleetDevice, 
  EntitlementKey,
  SupportCase,
  SupportImpersonationLog
} from '../../types/saas';
import { 
  Building2, 
  ShieldCheck, 
  Server, 
  CreditCard, 
  Plus, 
  Search, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Lock, 
  Activity, 
  Eye, 
  RefreshCw, 
  Printer, 
  Terminal, 
  Users, 
  Settings, 
  ArrowUpRight,
  LifeBuoy
} from 'lucide-react';

const INITIAL_TENANTS: Tenant[] = [
  {
    id: 't-001',
    name: 'Grand Nairobi Hotel & Towers',
    legalName: 'Grand Nairobi Hospitality Ltd',
    country: 'Kenya',
    currency: 'KES',
    timezone: 'Africa/Nairobi',
    ownerName: 'David Musau',
    ownerEmail: 'david@grandnairobi.co.ke',
    ownerPhone: '+254 700 000 111',
    status: 'ACTIVE',
    planId: 'plan-enterprise',
    planName: 'Enterprise Operating System',
    mrr: 285000,
    entitlements: [
      'restaurant.pos',
      'restaurant.kds',
      'restaurant.coursing',
      'restaurant.reservations',
      'restaurant.host_stand',
      'restaurant.crm',
      'inventory.predictive',
      'hotel.pms',
      'hotel.housekeeping',
      'finance.accounting',
      'finance.etims',
      'platform.multi_property'
    ],
    quotas: {
      maxProperties: 5,
      maxOutlets: 15,
      maxTerminals: 50,
      maxUsers: 200,
      monthlyOrderLimit: 100000
    },
    activePropertiesCount: 2,
    activeOutletsCount: 6,
    activeTerminalsCount: 18,
    createdAt: '2025-01-15',
    lastActiveAt: 'Just now',
    healthStatus: 'HEALTHY'
  },
  {
    id: 't-002',
    name: 'Westlands Rooftop Lounge & Grill',
    legalName: 'Westlands Food Group Ltd',
    country: 'Kenya',
    currency: 'KES',
    timezone: 'Africa/Nairobi',
    ownerName: 'Sarah Kamau',
    ownerEmail: 'sarah@westlandsrooftop.com',
    ownerPhone: '+254 722 111 222',
    status: 'ACTIVE',
    planId: 'plan-pro',
    planName: 'Pro Hospitality Suite',
    mrr: 120000,
    entitlements: [
      'restaurant.pos',
      'restaurant.kds',
      'restaurant.coursing',
      'restaurant.reservations',
      'restaurant.host_stand',
      'inventory.basic',
      'finance.etims'
    ],
    quotas: {
      maxProperties: 1,
      maxOutlets: 3,
      maxTerminals: 10,
      maxUsers: 30,
      monthlyOrderLimit: 30000
    },
    activePropertiesCount: 1,
    activeOutletsCount: 2,
    activeTerminalsCount: 6,
    createdAt: '2025-06-10',
    lastActiveAt: '4 mins ago',
    healthStatus: 'HEALTHY'
  },
  {
    id: 't-003',
    name: 'Kilimani Coastal Seafood & Bar',
    legalName: 'Kilimani Dining LLC',
    country: 'Kenya',
    currency: 'KES',
    timezone: 'Africa/Nairobi',
    ownerName: 'Ali Hassan',
    ownerEmail: 'ali@kilimaniseafood.co.ke',
    ownerPhone: '+254 733 888 999',
    status: 'PAST_DUE',
    planId: 'plan-starter',
    planName: 'Starter POS & Inventory',
    mrr: 45000,
    entitlements: [
      'restaurant.pos',
      'restaurant.kds',
      'inventory.basic',
      'finance.etims'
    ],
    quotas: {
      maxProperties: 1,
      maxOutlets: 1,
      maxTerminals: 3,
      maxUsers: 10,
      monthlyOrderLimit: 10000
    },
    activePropertiesCount: 1,
    activeOutletsCount: 1,
    activeTerminalsCount: 2,
    createdAt: '2026-02-01',
    lastActiveAt: '18 mins ago',
    healthStatus: 'WARNING'
  }
];

const INITIAL_FLEET: HardwareFleetDevice[] = [
  {
    id: 'dev-01',
    tenantId: 't-001',
    tenantName: 'Grand Nairobi Hotel',
    propertyId: 'p-01',
    propertyName: 'Main Property',
    deviceName: 'POS-Cashier-01 (Main Bar)',
    deviceType: 'POS_TERMINAL',
    serialNumber: 'SN-99201-KE',
    edgeVersion: 'v2.4.1-edge',
    ipAddress: '192.168.1.102',
    isOnline: true,
    lastSeenAt: '12s ago',
    queuedJobsCount: 0,
    status: 'OPTIMAL'
  },
  {
    id: 'dev-02',
    tenantId: 't-001',
    tenantName: 'Grand Nairobi Hotel',
    propertyId: 'p-01',
    propertyName: 'Main Property',
    deviceName: 'Kitchen Thermal Printer (KOT-01)',
    deviceType: 'THERMAL_PRINTER',
    serialNumber: 'EPS-8080-LAN',
    edgeVersion: 'v2.4.1-edge',
    ipAddress: '192.168.1.150',
    isOnline: true,
    lastSeenAt: '2s ago',
    queuedJobsCount: 0,
    status: 'OPTIMAL'
  },
  {
    id: 'dev-03',
    tenantId: 't-002',
    tenantName: 'Westlands Lounge',
    propertyId: 'p-02',
    propertyName: 'Rooftop Bar',
    deviceName: 'Bar Scale Bridge (Spirit AvT)',
    deviceType: 'BAR_SCALE_BRIDGE',
    serialNumber: 'SCL-4421-RS232',
    edgeVersion: 'v2.3.9-edge',
    ipAddress: '192.168.2.88',
    isOnline: false,
    lastSeenAt: '24 mins ago',
    queuedJobsCount: 3,
    status: 'DEGRADED'
  }
];

export const PlatformAdminView: React.FC = () => {
  const { showToast } = useServOS();
  const [activeTab, setActiveTab] = useState<'TENANTS' | 'PLANS' | 'FLEET' | 'SUPPORT_AUDIT'>('TENANTS');
  const [tenants, setTenants] = useState<Tenant[]>(INITIAL_TENANTS);
  const [fleet, setFleet] = useState<HardwareFleetDevice[]>(INITIAL_FLEET);
  const [selectedTenantId, setSelectedTenantId] = useState<string>(INITIAL_TENANTS[0].id);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Provisioning Modal State
  const [isProvisionModalOpen, setIsProvisionModalOpen] = useState<boolean>(false);
  const [newOrgName, setNewOrgName] = useState('');
  const [newOwnerName, setNewOwnerName] = useState('');
  const [newOwnerEmail, setNewOwnerEmail] = useState('');
  const [newPlan, setNewPlan] = useState('plan-pro');

  const selectedTenant = tenants.find(t => t.id === selectedTenantId) || tenants[0];

  const totalMrr = tenants.reduce((acc, t) => acc + (t.status === 'ACTIVE' ? t.mrr : 0), 0);
  const totalActiveTenants = tenants.filter(t => t.status === 'ACTIVE').length;

  const handleToggleTenantStatus = (tenantId: string) => {
    setTenants(prev => prev.map(t => {
      if (t.id === tenantId) {
        const nextStatus = t.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
        showToast(`Tenant "${t.name}" status updated to ${nextStatus}!`, 'info');
        return { ...t, status: nextStatus };
      }
      return t;
    }));
  };

  const handleStartImpersonation = (tenant: Tenant) => {
    showToast(`Support impersonation session initiated for tenant "${tenant.name}". Session logged in security audit trail.`, 'success');
  };

  const handleProvisionTenant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrgName || !newOwnerEmail) {
      showToast('Please enter tenant business name and owner email', 'error');
      return;
    }

    const newTenant: Tenant = {
      id: `t-${Date.now()}`,
      name: newOrgName,
      legalName: `${newOrgName} Ltd`,
      country: 'Kenya',
      currency: 'KES',
      timezone: 'Africa/Nairobi',
      ownerName: newOwnerName || 'Admin User',
      ownerEmail: newOwnerEmail,
      ownerPhone: '+254 700 000 000',
      status: 'ACTIVE',
      planId: newPlan,
      planName: newPlan === 'plan-enterprise' ? 'Enterprise OS' : 'Pro Hospitality Suite',
      mrr: newPlan === 'plan-enterprise' ? 285000 : 120000,
      entitlements: [
        'restaurant.pos',
        'restaurant.kds',
        'restaurant.coursing',
        'restaurant.reservations',
        'inventory.basic',
        'finance.etims'
      ],
      quotas: {
        maxProperties: 2,
        maxOutlets: 4,
        maxTerminals: 10,
        maxUsers: 25,
        monthlyOrderLimit: 50000
      },
      activePropertiesCount: 1,
      activeOutletsCount: 1,
      activeTerminalsCount: 2,
      createdAt: new Date().toISOString().split('T')[0],
      lastActiveAt: 'Just now',
      healthStatus: 'HEALTHY'
    };

    setTenants(prev => [newTenant, ...prev]);
    setSelectedTenantId(newTenant.id);
    setIsProvisionModalOpen(false);
    showToast(`New tenant "${newTenant.name}" provisioned successfully!`, 'success');

    setNewOrgName('');
    setNewOwnerName('');
    setNewOwnerEmail('');
  };

  return (
    <div className="h-full flex flex-col bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* SaaS Platform Control Header */}
      <div className="px-6 py-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-purple-500/10 border border-purple-500/20 rounded-xl text-purple-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              ServOS Platform Control Plane
              <span className="px-2 py-0.5 text-xs font-mono bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-full">
                SUPERADMIN CONTROL
              </span>
            </h1>
            <p className="text-xs text-slate-400 font-mono">
              Multi-Tenant Management • Entitlements • Hardware Fleet Telemetry • Platform Health
            </p>
          </div>
        </div>

        {/* Global Action */}
        <button
          onClick={() => setIsProvisionModalOpen(true)}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 transition-all shadow-lg shadow-purple-600/10"
        >
          <Plus className="w-4 h-4" />
          <span>Provision New Tenant</span>
        </button>
      </div>

      {/* KPI Overview Banner */}
      <div className="grid grid-cols-4 gap-4 p-6 bg-slate-900/40 border-b border-slate-800">
        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
            TOTAL ACTIVE TENANTS
          </span>
          <div className="text-2xl font-bold font-mono text-white flex items-center justify-between">
            <span>{totalActiveTenants} / {tenants.length}</span>
            <Building2 className="w-5 h-5 text-purple-400" />
          </div>
        </div>

        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
            MONTHLY RECURRING REVENUE
          </span>
          <div className="text-2xl font-bold font-mono text-emerald-400 flex items-center justify-between">
            <span>KES {totalMrr.toLocaleString()}</span>
            <CreditCard className="w-5 h-5 text-emerald-400" />
          </div>
        </div>

        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
            EDGE FLEET DEVICES
          </span>
          <div className="text-2xl font-bold font-mono text-amber-400 flex items-center justify-between">
            <span>{fleet.filter(f => f.isOnline).length} / {fleet.length} Online</span>
            <Server className="w-5 h-5 text-amber-400" />
          </div>
        </div>

        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
            SYSTEM HEALTH STATUS
          </span>
          <div className="text-2xl font-bold font-mono text-emerald-400 flex items-center justify-between">
            <span>OPTIMAL (99.98%)</span>
            <Activity className="w-5 h-5 text-emerald-400" />
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="px-6 border-b border-slate-800 bg-slate-900/60 flex items-center gap-6 text-xs font-mono font-bold">
        <button
          onClick={() => setActiveTab('TENANTS')}
          className={`py-3 border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'TENANTS' ? 'border-purple-500 text-purple-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Tenants Directory ({tenants.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('PLANS')}
          className={`py-3 border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'PLANS' ? 'border-purple-500 text-purple-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Plans & Entitlements Engine</span>
        </button>

        <button
          onClick={() => setActiveTab('FLEET')}
          className={`py-3 border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'FLEET' ? 'border-purple-500 text-purple-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Server className="w-4 h-4" />
          <span>Hardware Fleet Diagnostics ({fleet.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('SUPPORT_AUDIT')}
          className={`py-3 border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'SUPPORT_AUDIT' ? 'border-purple-500 text-purple-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <LifeBuoy className="w-4 h-4" />
          <span>Support Sessions & Security Audit</span>
        </button>
      </div>

      {/* Main Tab Content Area */}
      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === 'TENANTS' && (
          <div className="grid grid-cols-12 gap-6 h-full">
            {/* Left: Tenant Directory Table (Cols 8) */}
            <div className="col-span-8 space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search tenant name, owner, or email..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-purple-500 font-mono"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setStatusFilter('ALL')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                      statusFilter === 'ALL' ? 'bg-purple-600 text-white' : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setStatusFilter('ACTIVE')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                      statusFilter === 'ACTIVE' ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    Active
                  </button>
                  <button
                    onClick={() => setStatusFilter('PAST_DUE')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                      statusFilter === 'PAST_DUE' ? 'bg-amber-600 text-white' : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    Past Due
                  </button>
                </div>
              </div>

              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
                <table className="w-full text-left border-collapse font-mono text-xs">
                  <thead>
                    <tr className="bg-slate-900 text-slate-400 border-b border-slate-800">
                      <th className="p-3">TENANT ORGANISATION</th>
                      <th className="p-3">STATUS</th>
                      <th className="p-3">PLAN</th>
                      <th className="p-3">MONTHLY MRR</th>
                      <th className="p-3 text-right">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {tenants
                      .filter(t => statusFilter === 'ALL' || t.status === statusFilter)
                      .filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()) || t.ownerName.toLowerCase().includes(searchQuery.toLowerCase()))
                      .map(t => (
                        <tr
                          key={t.id}
                          onClick={() => setSelectedTenantId(t.id)}
                          className={`hover:bg-slate-800/40 cursor-pointer transition-colors ${
                            selectedTenantId === t.id ? 'bg-slate-800/80 border-l-4 border-l-purple-500' : ''
                          }`}
                        >
                          <td className="p-3">
                            <div className="font-bold text-white text-sm">{t.name}</div>
                            <div className="text-[11px] text-slate-400">{t.ownerName} • {t.ownerEmail}</div>
                          </td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              t.status === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                              t.status === 'PAST_DUE' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                              'bg-red-500/20 text-red-400 border border-red-500/30'
                            }`}>
                              {t.status}
                            </span>
                          </td>
                          <td className="p-3 text-slate-300 font-semibold">{t.planName}</td>
                          <td className="p-3 font-bold text-emerald-400">KES {t.mrr.toLocaleString()}</td>
                          <td className="p-3 text-right">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStartImpersonation(t);
                              }}
                              className="px-2.5 py-1 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-lg text-[10px] font-bold"
                            >
                              Support Session
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right: Selected Tenant Entitlements & Quotas Inspection Pane (Cols 4) */}
            <div className="col-span-4 bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="text-xs font-mono font-bold text-purple-400 uppercase tracking-wider">
                  Tenant Details & Entitlements
                </span>
                <span className="text-xs font-mono text-slate-400">ID: {selectedTenant.id}</span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white">{selectedTenant.name}</h3>
                <p className="text-xs font-mono text-slate-400">{selectedTenant.legalName}</p>
                <p className="text-xs font-mono text-slate-500 mt-1">Created on {selectedTenant.createdAt}</p>
              </div>

              {/* Usage Quotas */}
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3 font-mono text-xs">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                  CAPACITY QUOTAS & USAGE
                </span>

                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Active Properties:</span>
                  <span className="text-white font-bold">{selectedTenant.activePropertiesCount} / {selectedTenant.quotas.maxProperties}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Active Outlets:</span>
                  <span className="text-white font-bold">{selectedTenant.activeOutletsCount} / {selectedTenant.quotas.maxOutlets}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Active POS Terminals:</span>
                  <span className="text-white font-bold">{selectedTenant.activeTerminalsCount} / {selectedTenant.quotas.maxTerminals}</span>
                </div>
              </div>

              {/* Active Feature Entitlements List */}
              <div className="space-y-2 font-mono text-xs">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                  ENABLED FEATURE ENTITLEMENTS ({selectedTenant.entitlements.length})
                </span>

                <div className="grid grid-cols-1 gap-1.5 max-h-48 overflow-y-auto pr-1">
                  {selectedTenant.entitlements.map(ent => (
                    <div key={ent} className="p-2 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between text-slate-300">
                      <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {ent}
                      </span>
                      <span className="text-[10px] text-slate-500 font-bold">ACTIVE</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tenant Control Actions */}
              <div className="pt-4 border-t border-slate-800 space-y-2">
                <button
                  onClick={() => handleToggleTenantStatus(selectedTenant.id)}
                  className={`w-full py-2.5 rounded-xl font-mono text-xs font-bold transition-colors ${
                    selectedTenant.status === 'ACTIVE'
                      ? 'bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-500/30'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  }`}
                >
                  {selectedTenant.status === 'ACTIVE' ? 'Suspend Tenant Access' : 'Reactivate Tenant'}
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'PLANS' && (
          <div className="space-y-6 font-mono text-xs">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white">Subscription Plans & Entitlement Builder</h2>
                <p className="text-xs text-slate-400">Configure feature access keys for Starter, Pro, and Enterprise tiers</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6">
              <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold text-white">Starter POS</h3>
                    <p className="text-xs text-slate-400">Basic F&B Sales & eTIMS</p>
                  </div>
                  <span className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded font-bold">STARTER</span>
                </div>

                <div className="text-2xl font-bold text-emerald-400">
                  KES 45,000 <span className="text-xs text-slate-500 font-normal">/ month</span>
                </div>

                <ul className="space-y-2 pt-3 border-t border-slate-800 text-slate-300">
                  <li className="flex items-center gap-2 text-emerald-400"><CheckCircle2 className="w-3.5 h-3.5" /> POS Sales & Floorplan</li>
                  <li className="flex items-center gap-2 text-emerald-400"><CheckCircle2 className="w-3.5 h-3.5" /> Basic KDS Pass</li>
                  <li className="flex items-center gap-2 text-emerald-400"><CheckCircle2 className="w-3.5 h-3.5" /> Basic Inventory Ledger</li>
                  <li className="flex items-center gap-2 text-emerald-400"><CheckCircle2 className="w-3.5 h-3.5" /> KRA eTIMS Fiscalization</li>
                  <li className="flex items-center gap-2 text-slate-500"><XCircle className="w-3.5 h-3.5" /> Hotel PMS & Tape Chart</li>
                  <li className="flex items-center gap-2 text-slate-500"><XCircle className="w-3.5 h-3.5" /> Predictive Inventory AI</li>
                </ul>
              </div>

              <div className="p-5 bg-slate-900 border border-purple-500/50 rounded-2xl space-y-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-purple-600 text-white px-3 py-1 text-[10px] font-bold rounded-bl-xl">
                  POPULAR
                </div>

                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold text-white">Pro Hospitality</h3>
                    <p className="text-xs text-slate-400">Full Dining, Coursing & CRM</p>
                  </div>
                </div>

                <div className="text-2xl font-bold text-purple-400">
                  KES 120,000 <span className="text-xs text-slate-500 font-normal">/ month</span>
                </div>

                <ul className="space-y-2 pt-3 border-t border-slate-800 text-slate-300">
                  <li className="flex items-center gap-2 text-emerald-400"><CheckCircle2 className="w-3.5 h-3.5" /> All Starter Features</li>
                  <li className="flex items-center gap-2 text-emerald-400"><CheckCircle2 className="w-3.5 h-3.5" /> Host Stand & Reservations</li>
                  <li className="flex items-center gap-2 text-emerald-400"><CheckCircle2 className="w-3.5 h-3.5" /> Seat-Level Ordering & Coursing</li>
                  <li className="flex items-center gap-2 text-emerald-400"><CheckCircle2 className="w-3.5 h-3.5" /> CRM 360 & Loyalty Engine</li>
                  <li className="flex items-center gap-2 text-emerald-400"><CheckCircle2 className="w-3.5 h-3.5" /> Events & QR Door Access</li>
                  <li className="flex items-center gap-2 text-slate-500"><XCircle className="w-3.5 h-3.5" /> Hotel PMS & Tape Chart</li>
                </ul>
              </div>

              <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold text-white">Enterprise OS</h3>
                    <p className="text-xs text-slate-400">Hotel, F&B, Accounting & Multi-Property</p>
                  </div>
                  <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded font-bold">FULL UNLOCK</span>
                </div>

                <div className="text-2xl font-bold text-amber-400">
                  KES 285,000 <span className="text-xs text-slate-500 font-normal">/ month</span>
                </div>

                <ul className="space-y-2 pt-3 border-t border-slate-800 text-slate-300">
                  <li className="flex items-center gap-2 text-emerald-400"><CheckCircle2 className="w-3.5 h-3.5" /> All Pro Features</li>
                  <li className="flex items-center gap-2 text-emerald-400"><CheckCircle2 className="w-3.5 h-3.5" /> Hotel PMS & Tape Chart</li>
                  <li className="flex items-center gap-2 text-emerald-400"><CheckCircle2 className="w-3.5 h-3.5" /> Predictive Inventory Forecasting</li>
                  <li className="flex items-center gap-2 text-emerald-400"><CheckCircle2 className="w-3.5 h-3.5" /> Double-Entry Accounting ERP</li>
                  <li className="flex items-center gap-2 text-emerald-400"><CheckCircle2 className="w-3.5 h-3.5" /> Multi-Property Consolidation</li>
                  <li className="flex items-center gap-2 text-emerald-400"><CheckCircle2 className="w-3.5 h-3.5" /> Dedicated SLA Support</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'FLEET' && (
          <div className="space-y-4 font-mono text-xs">
            <h2 className="text-base font-bold text-white">Hardware Fleet Remote Diagnostics</h2>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950 text-slate-400 border-b border-slate-800">
                    <th className="p-3">DEVICE NAME</th>
                    <th className="p-3">TENANT</th>
                    <th className="p-3">TYPE</th>
                    <th className="p-3">EDGE VERSION</th>
                    <th className="p-3">IP ADDRESS</th>
                    <th className="p-3">STATUS</th>
                    <th className="p-3 text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {fleet.map(dev => (
                    <tr key={dev.id} className="hover:bg-slate-800/40">
                      <td className="p-3 font-bold text-white flex items-center gap-2">
                        <Terminal className="w-4 h-4 text-purple-400" />
                        {dev.deviceName}
                      </td>
                      <td className="p-3 text-slate-300">{dev.tenantName}</td>
                      <td className="p-3 text-slate-400 font-semibold">{dev.deviceType}</td>
                      <td className="p-3 text-slate-400">{dev.edgeVersion}</td>
                      <td className="p-3 text-slate-400">{dev.ipAddress}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          dev.isOnline ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                        }`}>
                          {dev.isOnline ? 'ONLINE' : 'OFFLINE'}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => showToast(`Sent test ping to ${dev.deviceName} at ${dev.ipAddress}!`, 'info')}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded font-bold"
                        >
                          Ping Device
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'SUPPORT_AUDIT' && (
          <div className="space-y-4 font-mono text-xs">
            <h2 className="text-base font-bold text-white">Support Sessions & Security Impersonation Audit Log</h2>

            <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
              <div className="flex justify-between items-center p-3 bg-slate-950 border border-slate-800 rounded-xl">
                <div>
                  <span className="text-emerald-400 font-bold block">ACTIVE IMPERSONATION SESSION</span>
                  <span className="text-slate-300">Admin: superadmin@servos.co.ke $\rightarrow$ Tenant: Grand Nairobi Hotel</span>
                  <p className="text-[11px] text-slate-500">Reason: Debugging eTIMS tax transmission failure for INV-0028</p>
                </div>
                <span className="px-3 py-1 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-full font-bold">
                  Expires in 42 mins
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal: Tenant Provisioning Wizard */}
      {isProvisionModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-purple-400" />
                Provision New ServOS Tenant
              </h3>
              <button
                onClick={() => setIsProvisionModalOpen(false)}
                className="text-slate-400 hover:text-white text-lg font-mono"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleProvisionTenant} className="p-6 space-y-4 font-mono text-xs">
              <div>
                <label className="block text-slate-400 mb-1">BUSINESS / ORGANISATION NAME</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Carnivore Restaurant Nairobi"
                  value={newOrgName}
                  onChange={e => setNewOrgName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:border-purple-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">OWNER FULL NAME</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Jane Doe"
                    value={newOwnerName}
                    onChange={e => setNewOwnerName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:border-purple-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">OWNER EMAIL</label>
                  <input
                    type="email"
                    required
                    placeholder="jane@carnivore.co.ke"
                    value={newOwnerEmail}
                    onChange={e => setNewOwnerEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:border-purple-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">SUBSCRIPTION PLAN</label>
                <select
                  value={newPlan}
                  onChange={e => setNewPlan(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:border-purple-500 outline-none"
                >
                  <option value="plan-starter">Starter POS & Inventory (KES 45,000/mo)</option>
                  <option value="plan-pro">Pro Hospitality Suite (KES 120,000/mo)</option>
                  <option value="plan-enterprise">Enterprise Operating System (KES 285,000/mo)</option>
                </select>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsProvisionModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl shadow-lg shadow-purple-600/10"
                >
                  Provision Tenant
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
