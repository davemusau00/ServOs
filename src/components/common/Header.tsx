import React from 'react';
import { useServOS } from '../../context/ServOSContext';
import { 
  Wifi, 
  WifiOff, 
  Building2, 
  UserCheck, 
  Layers, 
  Printer, 
  ShieldAlert,
  SlidersHorizontal,
  ChevronDown
} from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenHardwareModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenHardwareModal
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

  const openAlertsCount = anomalyAlerts.filter(a => a.status === 'OPEN').length;
  const pendingApprovalsCount = approvalRequests.filter(a => a.status === 'PENDING').length;

  const navLinks = [
    { id: 'pos', label: 'POS & Tables' },
    { id: 'kds', label: 'KDS Pass' },
    { id: 'hotel', label: 'Hotel PMS' },
    { id: 'inventory', label: 'Inventory & Yield' },
    { id: 'procurement', label: 'Procurement & AP' },
    { id: 'accounting', label: 'Accounting & eTIMS' },
    { id: 'control', label: `Control & Audit` },
    { id: 'staff', label: 'Staff & Cash' }
  ];

  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-40 select-none">
      <div className="max-w-[1720px] mx-auto px-4 h-15 flex items-center justify-between gap-4">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center font-black text-slate-950 text-base shadow-sm">
              S
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5 font-sans">
                ServOS
              </span>
              <p className="text-[10px] text-amber-400/90 font-mono tracking-wider -mt-1 uppercase">
                Hospitality ERP
              </p>
            </div>
          </div>

          <div className="h-5 w-[1px] bg-slate-700/60 hidden md:block mx-1" />

          {/* Property & Outlet selector */}
          <div className="hidden lg:flex items-center gap-2 text-xs">
            <span className="text-slate-400 font-medium truncate max-w-[160px]">
              {currentProperty.name}
            </span>
            <span className="text-slate-600">/</span>
            <div className="relative group">
              <select
                value={currentOutlet.id}
                onChange={e => {
                  const out = outlets.find(o => o.id === e.target.value);
                  if (out) setCurrentOutlet(out);
                }}
                className="bg-slate-800 border border-slate-700 text-amber-300 font-semibold rounded px-2 py-1 pr-6 text-xs appearance-none cursor-pointer focus:outline-none focus:border-amber-400 hover:bg-slate-750"
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

        {/* Zone 2: Navigation Links (Text with subtle hover and clean active state) */}
        <nav className="flex items-center gap-1 overflow-x-auto py-1 scrollbar-none">
          {navLinks.map(link => {
            const isActive = activeTab === link.id;
            return (
              <button
                key={link.id}
                onClick={() => setActiveTab(link.id)}
                className={`relative px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors rounded ${
                  isActive
                    ? 'text-white bg-slate-800 font-bold shadow-xs'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                {link.label}
                {link.id === 'control' && (openAlertsCount > 0 || pendingApprovalsCount > 0) && (
                  <span className="ml-1.5 px-1.5 py-0.2 text-[10px] font-mono font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded">
                    {openAlertsCount + pendingApprovalsCount}
                  </span>
                )}
                {isActive && (
                  <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-amber-400 rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Actions & Status */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Offline Mode Toggle & Sync */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={toggleOfflineMode}
              title={isOffline ? 'Offline Mode Active - Click to reconnect' : 'Simulate Network Outage'}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded border transition-colors ${
                isOffline
                  ? 'bg-rose-950/70 border-rose-600/60 text-rose-300 animate-pulse'
                  : 'bg-slate-800/80 border-slate-700/60 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {isOffline ? <WifiOff className="w-3.5 h-3.5" /> : <Wifi className="w-3.5 h-3.5 text-emerald-400" />}
              <span className="hidden sm:inline font-mono">
                {isOffline ? 'OFFLINE' : 'ONLINE'}
              </span>
            </button>

            {offlineQueueCount > 0 && (
              <button
                onClick={syncOfflineQueue}
                title="Sync queued transactions"
                className="px-2 py-1 text-xs font-mono font-bold bg-amber-500 text-slate-950 rounded hover:bg-amber-400 flex items-center gap-1 shadow-sm"
              >
                <span>SYNC ({offlineQueueCount})</span>
              </button>
            )}
          </div>

          {/* Edge Hardware Bridge status */}
          <button
            onClick={onOpenHardwareModal}
            title="Inspect Edge Hardware Devices (Printers, Drawer, Scale)"
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-slate-300 bg-slate-800 border border-slate-700 rounded hover:bg-slate-750 transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden xl:inline font-mono">Edge LAN</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </button>

          {/* Active Employee Switcher */}
          <div className="relative group">
            <select
              value={currentUser.id}
              onChange={e => {
                const emp = employees.find(em => em.id === e.target.value);
                if (emp) setCurrentUser(emp);
              }}
              className="bg-slate-800 border border-slate-700 text-slate-200 font-medium rounded px-2.5 py-1 pr-6 text-xs appearance-none cursor-pointer focus:outline-none focus:border-amber-400 hover:bg-slate-750"
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
  );
};
