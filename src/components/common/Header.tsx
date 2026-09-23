import React, { useState } from 'react';
import { useServOS } from '../../context/ServOSContext';
import { 
  Wifi, 
  WifiOff, 
  Building2, 
  Printer, 
  ShieldAlert,
  ChevronDown,
  Menu,
  X,
  Utensils,
  Flame,
  Bed,
  Boxes,
  FileSpreadsheet,
  Receipt,
  Coins,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenHardwareModal: () => void;
  isSidebarCollapsed: boolean;
  onToggleSidebarCollapse: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenHardwareModal,
  isSidebarCollapsed,
  onToggleSidebarCollapse
}) => {
  const {
    currentProperty,
    outlets,
    currentOutlet,
    setCurrentOutlet,
    employees,
    currentUser,
    setCurrentUser,
    isOffline,
    toggleOfflineMode,
    offlineQueueCount,
    syncOfflineQueue,
    anomalyAlerts,
    approvalRequests
  } = useServOS();

  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  const openAlertsCount = anomalyAlerts.filter(a => a.status === 'OPEN').length;
  const pendingApprovalsCount = approvalRequests.filter(a => a.status === 'PENDING').length;
  const totalControlAlerts = openAlertsCount + pendingApprovalsCount;

  const navLinks = [
    { id: 'pos', label: 'POS & Tables', icon: Utensils, desc: 'Floorplan, bills & settlement' },
    { id: 'kds', label: 'KDS Pass', icon: Flame, desc: 'Kitchen & bar prep stations' },
    { id: 'hotel', label: 'Hotel PMS', icon: Bed, desc: 'Rooms, folios & minibar' },
    { id: 'inventory', label: 'Inventory & Yield', icon: Boxes, desc: 'Spirits yield & stock depletion' },
    { id: 'procurement', label: 'Procurement & AP', icon: FileSpreadsheet, desc: 'POs, GRN & 3-way match' },
    { id: 'accounting', label: 'Accounting & eTIMS', icon: Receipt, desc: 'Double-entry & KRA fiscal' },
    { id: 'control', label: 'Control & Audit', icon: ShieldAlert, desc: 'Anomalies & approvals' },
    { id: 'staff', label: 'Staff & Cash', icon: Coins, desc: 'Tills, cash in/out & tips' }
  ];

  const handleSelectTab = (tabId: string) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header className="border-b border-slate-800 bg-slate-900/95 backdrop-blur sticky top-0 z-40 select-none">
        <div className="w-full px-3 sm:px-4 h-14 sm:h-15 flex items-center justify-between gap-3">
          {/* Zone 1: Mobile Hamburger & Desktop Sidebar Toggle + Active Outlet Selector */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0 min-w-0">
            {/* Mobile Hamburger Button (< lg) */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Desktop Sidebar Toggle Button (>= lg) */}
            <button
              onClick={onToggleSidebarCollapse}
              title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              className="hidden lg:flex items-center justify-center p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              {isSidebarCollapsed ? (
                <PanelLeftOpen className="w-4 h-4 text-amber-400" />
              ) : (
                <PanelLeftClose className="w-4 h-4 text-slate-400" />
              )}
            </button>

            {/* Mobile Brand Logo (< lg) */}
            <div 
              className="flex lg:hidden items-center gap-2 cursor-pointer" 
              onClick={() => handleSelectTab('pos')}
            >
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center font-black text-slate-950 text-sm shadow-sm">
                S
              </div>
              <span className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-1 font-sans">
                ServOS
              </span>
            </div>

            <div className="h-5 w-[1px] bg-slate-700/60 hidden sm:block" />

            {/* Property & Outlet selector */}
            <div className="flex items-center gap-1.5 text-xs min-w-0">
              <span className="text-slate-400 font-medium truncate max-w-[120px] sm:max-w-[170px] hidden sm:inline">
                {currentProperty.name}
              </span>
              <span className="text-slate-600 hidden sm:inline">/</span>
              <div className="relative group">
                <select
                  value={currentOutlet.id}
                  onChange={e => {
                    const out = outlets.find(o => o.id === e.target.value);
                    if (out) setCurrentOutlet(out);
                  }}
                  className="bg-slate-800 border border-slate-700 text-amber-300 font-semibold rounded-lg px-2 sm:px-2.5 py-1 pr-6 text-xs appearance-none cursor-pointer focus:outline-none focus:border-amber-400 hover:bg-slate-750 max-w-[140px] sm:max-w-[200px] truncate"
                >
                  {outlets.map(out => (
                    <option key={out.id} value={out.id}>
                      {out.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Zone 2: Right Status & Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Offline Mode Toggle & Sync */}
            <div className="flex items-center gap-1">
              <button
                onClick={toggleOfflineMode}
                title={isOffline ? 'Offline Mode Active - Click to reconnect' : 'Simulate Network Outage'}
                className={`flex items-center gap-1.5 px-2 sm:px-2.5 py-1 text-xs font-medium rounded-lg border transition-colors ${
                  isOffline
                    ? 'bg-rose-950/70 border-rose-600/60 text-rose-300 animate-pulse'
                    : 'bg-slate-800/80 border-slate-700/60 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {isOffline ? <WifiOff className="w-3.5 h-3.5" /> : <Wifi className="w-3.5 h-3.5 text-emerald-400" />}
                <span className="hidden md:inline font-mono">
                  {isOffline ? 'OFFLINE' : 'ONLINE'}
                </span>
              </button>

              {offlineQueueCount > 0 && (
                <button
                  onClick={syncOfflineQueue}
                  title="Sync queued transactions"
                  className="px-2 py-1 text-xs font-mono font-bold bg-amber-500 text-slate-950 rounded-lg hover:bg-amber-400 flex items-center gap-1 shadow-sm"
                >
                  <span>SYNC ({offlineQueueCount})</span>
                </button>
              )}
            </div>

            {/* Edge Hardware Bridge status */}
            <button
              onClick={onOpenHardwareModal}
              title="Inspect Edge Hardware Devices (Printers, Drawer, Scale)"
              className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 text-xs text-slate-300 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-750 transition-colors"
            >
              <Printer className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden md:inline font-mono">Hardware</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </button>

            {/* Active Employee Switcher */}
            <div className="relative group hidden sm:block">
              <select
                value={currentUser.id}
                onChange={e => {
                  const emp = employees.find(em => em.id === e.target.value);
                  if (emp) setCurrentUser(emp);
                }}
                className="bg-slate-800 border border-slate-700 text-slate-200 font-medium rounded-lg px-2.5 py-1 pr-6 text-xs appearance-none cursor-pointer focus:outline-none focus:border-amber-400 hover:bg-slate-750 max-w-[150px] truncate"
              >
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} ({emp.role})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3 h-3 text-slate-400 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>
      </header>

      {/* MOBILE DRAWER OVERLAY (< lg) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer content */}
          <div className="fixed inset-y-0 left-0 w-[300px] sm:w-[340px] bg-slate-900 border-r border-slate-800 shadow-2xl flex flex-col z-10">
            {/* Drawer Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center font-black text-slate-950 text-base">
                  S
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">ServOS Enterprise</h3>
                  <p className="text-[10px] text-amber-400 font-mono">Hospitality ERP & POS</p>
                </div>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Outlet Selector in Mobile Drawer */}
            <div className="p-3 bg-slate-950/40 border-b border-slate-800 space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono block">
                Active Property & Outlet
              </label>
              <div className="relative">
                <select
                  value={currentOutlet.id}
                  onChange={e => {
                    const out = outlets.find(o => o.id === e.target.value);
                    if (out) setCurrentOutlet(out);
                  }}
                  className="w-full bg-slate-850 border border-slate-700 text-amber-300 font-semibold rounded-lg p-2 pr-8 text-xs appearance-none focus:outline-none focus:border-amber-400"
                >
                  {outlets.map(out => (
                    <option key={out.id} value={out.id}>
                      {currentProperty.name} • {out.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Navigation Modules List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono px-2 py-1">
                System Modules
              </div>
              {navLinks.map(link => {
                const Icon = link.icon;
                const isActive = activeTab === link.id;
                return (
                  <button
                    key={link.id}
                    onClick={() => handleSelectTab(link.id)}
                    className={`w-full p-2.5 rounded-xl flex items-center justify-between text-left transition-all ${
                      isActive
                        ? 'bg-amber-500/15 border border-amber-500/40 text-amber-300 font-semibold'
                        : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${isActive ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-800 text-slate-400'}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold">{link.label}</div>
                        <div className="text-[10px] text-slate-400">{link.desc}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {link.id === 'control' && totalControlAlerts > 0 && (
                        <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-rose-500/20 text-rose-400 rounded-full border border-rose-500/30">
                          {totalControlAlerts}
                        </span>
                      )}
                      <ChevronRight className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-slate-600'}`} />
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Current Staff Switcher & Edge Footer */}
            <div className="p-3 bg-slate-950/80 border-t border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold">Active Staff Shift:</span>
                <span className="text-[10px] font-mono text-emerald-400 font-bold">PIN VERIFIED</span>
              </div>
              <div className="relative">
                <select
                  value={currentUser.id}
                  onChange={e => {
                    const emp = employees.find(em => em.id === e.target.value);
                    if (emp) setCurrentUser(emp);
                  }}
                  className="w-full bg-slate-800 border border-slate-700 text-slate-200 font-medium rounded-lg p-2 text-xs appearance-none focus:outline-none"
                >
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({emp.role})
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MOBILE STICKY BOTTOM NAVIGATION BAR (< lg) */}
      <nav className="fixed bottom-0 inset-x-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 lg:hidden flex items-center justify-around h-14 px-2 safe-area-bottom no-print">
        <button
          onClick={() => handleSelectTab('pos')}
          className={`flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-medium transition-colors ${
            activeTab === 'pos' ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Utensils className="w-4 h-4 mb-0.5" />
          <span>POS</span>
        </button>

        <button
          onClick={() => handleSelectTab('kds')}
          className={`flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-medium transition-colors ${
            activeTab === 'kds' ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Flame className="w-4 h-4 mb-0.5" />
          <span>KDS</span>
        </button>

        <button
          onClick={() => handleSelectTab('hotel')}
          className={`flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-medium transition-colors ${
            activeTab === 'hotel' ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Bed className="w-4 h-4 mb-0.5" />
          <span>Hotel</span>
        </button>

        <button
          onClick={() => handleSelectTab('control')}
          className={`relative flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-medium transition-colors ${
            activeTab === 'control' ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShieldAlert className="w-4 h-4 mb-0.5" />
          <span>Control</span>
          {totalControlAlerts > 0 && (
            <span className="absolute top-1 right-3 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-slate-900 animate-pulse" />
          )}
        </button>

        <button
          onClick={() => setMobileMenuOpen(true)}
          className="flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-medium text-slate-400 hover:text-slate-200"
        >
          <Menu className="w-4 h-4 mb-0.5" />
          <span>More</span>
        </button>
      </nav>
    </>
  );
};
