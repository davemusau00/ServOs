import React, { useState, useEffect, useMemo } from 'react';
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
  Users,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  CreditCard,
  Scale,
  AlertTriangle,
  CheckCircle2,
  SlidersHorizontal,
  Info
} from 'lucide-react';
import { GlobalSearchModal } from './GlobalSearchModal';
import { OfflineQueueModal } from './OfflineQueueModal';
import { EdgeDevice, EdgeDeviceStatus } from '../../types/servos';
import { calculatePredictiveInventory, PredictiveStockAnalysis } from '../../utils/predictiveStock';

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
    approvalRequests,
    edgeDevices,
    stockItems,
    stockMovements
  } = useServOS();

  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [searchModalOpen, setSearchModalOpen] = useState<boolean>(false);
  const [hardwareDropdownOpen, setHardwareDropdownOpen] = useState<boolean>(false);
  const [offlineQueueModalOpen, setOfflineQueueModalOpen] = useState<boolean>(false);

  // Calculate Predictive Low-Stock Alerts for Global Search Bar Indicator
  const predictiveAlerts = useMemo(() => {
    return calculatePredictiveInventory(stockItems || [], stockMovements || []).filter(
      (p: PredictiveStockAnalysis) => p.urgencyLevel === 'CRITICAL' || p.urgencyLevel === 'WARNING'
    );
  }, [stockItems, stockMovements]);

  const criticalStockoutsCount = predictiveAlerts.filter((p: PredictiveStockAnalysis) => p.urgencyLevel === 'CRITICAL').length;

  const openAlertsCount = anomalyAlerts.filter(a => a.status === 'OPEN').length;
  const pendingApprovalsCount = approvalRequests.filter(a => a.status === 'PENDING').length;
  const totalControlAlerts = openAlertsCount + pendingApprovalsCount;

  // Global Hotkey for Search (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchModalOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const navLinks = [
    { id: 'pos', label: 'POS & Tables', icon: Utensils, desc: 'Floorplan, bills & settlement' },
    { id: 'kds', label: 'KDS Pass', icon: Flame, desc: 'Kitchen & bar prep stations' },
    { id: 'hotel', label: 'Hotel PMS', icon: Bed, desc: 'Rooms, folios & minibar' },
    { id: 'inventory', label: 'Inventory & Yield', icon: Boxes, desc: 'Spirits yield & stock depletion' },
    { id: 'procurement', label: 'Procurement & AP', icon: FileSpreadsheet, desc: 'POs, GRN & 3-way match' },
    { id: 'accounting', label: 'Accounting & eTIMS', icon: Receipt, desc: 'Double-entry & KRA fiscal' },
    { id: 'control', label: 'Control & Audit', icon: ShieldAlert, desc: 'Anomalies & approvals' },
    { id: 'staff', label: 'Staff & HR Hub', icon: Users, desc: 'Payroll, leave, shifts & till' }
  ];

  const handleSelectTab = (tabId: string) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
  };

  // Hardware Status Aggregations
  const fiscalDevice = edgeDevices.find(d => d.type === 'FISCAL_PRINTER');
  const cardReaderDevice = edgeDevices.find(d => d.type === 'CARD_READER');
  const receiptPrinterDevice = edgeDevices.find(d => d.type === 'RECEIPT_PRINTER');
  const kitchenPrinterDevice = edgeDevices.find(d => d.type === 'KITCHEN_PRINTER');
  const drawerDevice = edgeDevices.find(d => d.type === 'CASH_DRAWER');
  const scaleDevice = edgeDevices.find(d => d.type === 'WEIGHING_SCALE');

  const onlineCount = edgeDevices.filter(d => d.status === 'ONLINE').length;
  const errorDevices = edgeDevices.filter(d => d.status === 'ERROR');
  const hasHardwareError = errorDevices.length > 0;
  const hasHardwareOffline = edgeDevices.some(d => d.status === 'OFFLINE');

  // Helper to get color for individual hardware icon
  const getDeviceStatusColor = (device?: EdgeDevice) => {
    if (!device) return 'text-slate-500';
    if (device.status === 'ONLINE') return 'text-emerald-400';
    if (device.status === 'ERROR') return 'text-rose-400 animate-pulse';
    return 'text-slate-400';
  };

  const getDeviceStatusDot = (device?: EdgeDevice) => {
    if (!device) return 'bg-slate-600';
    if (device.status === 'ONLINE') return 'bg-emerald-400';
    if (device.status === 'ERROR') return 'bg-rose-500 animate-ping';
    return 'bg-slate-500';
  };

  return (
    <>
      <header className="border-b border-slate-800 bg-slate-900/95 backdrop-blur sticky top-0 z-40 select-none">
        <div className="w-full max-w-full px-2.5 sm:px-4 h-14 sm:h-15 flex items-center justify-between gap-1.5 sm:gap-3">
          {/* Zone 1: Mobile Hamburger & Desktop Sidebar Toggle + Active Outlet Selector */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0 flex-1">
            {/* Mobile Hamburger Button (< md) */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 sm:p-2 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 focus:outline-none shrink-0"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Desktop & Tablet Sidebar Toggle Button (>= md) */}
            <button
              onClick={onToggleSidebarCollapse}
              title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              className="hidden md:flex items-center justify-center p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors shrink-0"
            >
              {isSidebarCollapsed ? (
                <PanelLeftOpen className="w-4 h-4 text-amber-400" />
              ) : (
                <PanelLeftClose className="w-4 h-4 text-slate-400" />
              )}
            </button>

            {/* Mobile Brand Logo (< md) */}
            <div 
              className="flex md:hidden items-center gap-1.5 cursor-pointer shrink-0" 
              onClick={() => handleSelectTab('pos')}
            >
              <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center font-black text-slate-950 text-xs shadow-sm shrink-0">
                S
              </div>
              <span className="text-sm font-bold tracking-tight text-white font-sans shrink-0 hidden xs:inline">
                ServOS
              </span>
            </div>

            <div className="h-5 w-[1px] bg-slate-700/60 hidden sm:block shrink-0" />

            {/* Property & Outlet selector */}
            <div className="flex items-center gap-1 sm:gap-1.5 text-xs min-w-0 shrink">
              <span className="text-slate-400 font-medium truncate max-w-[90px] sm:max-w-[130px] hidden sm:inline">
                {currentProperty.name}
              </span>
              <span className="text-slate-600 hidden sm:inline">/</span>
              <div className="relative group min-w-0 max-w-[110px] xs:max-w-[130px] sm:max-w-[160px] md:max-w-[180px]">
                <select
                  value={currentOutlet.id}
                  onChange={e => {
                    const out = outlets.find(o => o.id === e.target.value);
                    if (out) setCurrentOutlet(out);
                  }}
                  className="w-full bg-slate-800 border border-slate-700 text-amber-300 font-semibold rounded-lg px-2 sm:px-2.5 py-1 pr-5 sm:pr-6 text-[11px] sm:text-xs appearance-none cursor-pointer focus:outline-none focus:border-amber-400 hover:bg-slate-750 truncate"
                >
                  {outlets.map(out => (
                    <option key={out.id} value={out.id}>
                      {out.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3 h-3 text-slate-400 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Zone 2: Central Global Search Bar */}
          <div className="flex items-center justify-center flex-1 max-w-xs sm:max-w-sm md:max-w-md mx-1 sm:mx-2">
            <button
              onClick={() => setSearchModalOpen(true)}
              className="w-full flex items-center justify-between gap-2 px-2.5 sm:px-3 py-1.5 bg-slate-950/60 hover:bg-slate-800/80 border border-slate-750 hover:border-amber-500/50 rounded-xl text-slate-400 hover:text-slate-200 transition-all shadow-inner group"
              title="Global Search (Press Cmd+K / Ctrl+K)"
            >
              <div className="flex items-center gap-2 min-w-0">
                <Search className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform shrink-0" />
                <span className="text-xs font-medium truncate text-left hidden sm:inline text-slate-300">
                  Search items, guests, folios, invoices...
                </span>
                <span className="text-xs font-medium truncate text-left sm:hidden text-slate-300">
                  Quick search...
                </span>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {/* Urgent Predictive Low-Stock Notification in Search Bar */}
                {predictiveAlerts.length > 0 && (
                  <span 
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveTab('inventory');
                    }}
                    className={`hidden lg:inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold border transition-colors ${
                      criticalStockoutsCount > 0 
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse hover:bg-rose-500/30' 
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/30 hover:bg-amber-500/30'
                    }`}
                    title="Predictive Low-Stock Alert: Click to view inventory forecasting"
                  >
                    <AlertTriangle className="w-3 h-3 text-rose-400" />
                    <span>{criticalStockoutsCount > 0 ? `${criticalStockoutsCount} CRITICAL` : `${predictiveAlerts.length} LOW STOCK`}</span>
                  </span>
                )}

                <kbd className="hidden sm:flex items-center gap-0.5 font-mono text-[10px] bg-slate-800 border border-slate-700 text-slate-400 px-1.5 py-0.5 rounded shadow-xs">
                  <span>⌘</span>K
                </kbd>
              </div>
            </button>
          </div>

          {/* Zone 3: Right Hardware Indicators, Offline Mode & User Switcher */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* Visual Indicator: Connected Edge Hardware (Fiscal, Card Reader, Printers) */}
            <div className="relative">
              <button
                onClick={onOpenHardwareModal}
                onMouseEnter={() => setHardwareDropdownOpen(true)}
                onMouseLeave={() => setHardwareDropdownOpen(false)}
                title="Hardware status: Click to open Edge LAN Hardware Controller"
                className={`flex items-center gap-1.5 px-2 py-1 text-xs font-mono rounded-lg border transition-all shrink-0 ${
                  hasHardwareError
                    ? 'bg-rose-950/50 border-rose-600/60 text-rose-200 shadow-sm shadow-rose-950/50 ring-1 ring-rose-500/40'
                    : hasHardwareOffline
                    ? 'bg-amber-950/30 border-amber-600/40 text-amber-300'
                    : 'bg-slate-800/90 border-slate-700/80 text-slate-300 hover:bg-slate-750 hover:border-slate-600'
                }`}
              >
                {/* 1. Fiscal Printer Icon Indicator */}
                <span className="relative flex items-center" title={`Fiscal OSCU Box: ${fiscalDevice?.status || 'ONLINE'}`}>
                  <Receipt className={`w-3.5 h-3.5 ${getDeviceStatusColor(fiscalDevice)}`} />
                  <span className={`absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full ${getDeviceStatusDot(fiscalDevice)}`} />
                </span>

                {/* 2. EMV Card Reader Icon Indicator */}
                <span className="relative flex items-center" title={`EMV Card Terminal: ${cardReaderDevice?.status || 'ONLINE'}`}>
                  <CreditCard className={`w-3.5 h-3.5 ${getDeviceStatusColor(cardReaderDevice)}`} />
                  <span className={`absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full ${getDeviceStatusDot(cardReaderDevice)}`} />
                </span>

                {/* 3. Thermal Receipt Printer Icon Indicator */}
                <span className="relative flex items-center hidden xs:flex" title={`Receipt & Kitchen Printers: ${receiptPrinterDevice?.status || 'ONLINE'}`}>
                  <Printer className={`w-3.5 h-3.5 ${getDeviceStatusColor(receiptPrinterDevice)}`} />
                  <span className={`absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full ${getDeviceStatusDot(receiptPrinterDevice)}`} />
                </span>

                {/* Label text */}
                <span className="hidden xl:inline text-[11px] font-bold tracking-tight ml-0.5">
                  {hasHardwareError ? `${errorDevices.length} HW FAULT` : `${onlineCount}/${edgeDevices.length} HW`}
                </span>

                {/* Overall status glowing dot */}
                <span className={`w-2 h-2 rounded-full ${
                  hasHardwareError 
                    ? 'bg-rose-500 animate-ping' 
                    : hasHardwareOffline 
                    ? 'bg-amber-400' 
                    : 'bg-emerald-400 animate-pulse'
                }`} />
              </button>

              {/* Hardware Quick Dropdown Preview on hover / click */}
              {hardwareDropdownOpen && (
                <div 
                  className="absolute right-0 top-full mt-1.5 w-64 bg-slate-900 border border-slate-750 rounded-xl p-3 shadow-2xl z-50 animate-in fade-in duration-100 hidden sm:block"
                  onMouseEnter={() => setHardwareDropdownOpen(true)}
                  onMouseLeave={() => setHardwareDropdownOpen(false)}
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-[11px] font-mono">
                    <span className="font-bold text-slate-200 uppercase">Edge Peripherals</span>
                    <span className={`px-1.5 py-0.5 rounded font-bold ${
                      hasHardwareError ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'
                    }`}>
                      {onlineCount}/{edgeDevices.length} Online
                    </span>
                  </div>

                  <div className="py-2 space-y-1.5 text-xs font-mono">
                    {edgeDevices.slice(0, 4).map(dev => (
                      <div key={dev.id} className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-300 truncate max-w-[140px]">
                          {dev.name.split('(')[0]}
                        </span>
                        <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                          dev.status === 'ONLINE' ? 'text-emerald-400 bg-emerald-500/10' :
                          dev.status === 'ERROR' ? 'text-rose-400 bg-rose-500/10 animate-pulse' :
                          'text-slate-400 bg-slate-800'
                        }`}>
                          {dev.status}
                        </span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={onOpenHardwareModal}
                    className="w-full mt-1 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-bold text-center transition-colors block"
                  >
                    Open Hardware Diagnostics
                  </button>
                </div>
              )}
            </div>

            {/* Offline Mode Toggle & Sync */}
            <div className="flex items-center gap-1">
              <button
                onClick={toggleOfflineMode}
                title={isOffline ? 'Offline Mode Active - Click to reconnect or right-click to inspect' : 'Click to simulate network outage'}
                className={`flex items-center justify-center gap-1 p-1.5 sm:px-2.5 sm:py-1 text-xs font-medium rounded-lg border transition-colors shrink-0 ${
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

              <button
                onClick={() => setOfflineQueueModalOpen(true)}
                title="Open IndexedDB Offline Queue & Sync Engine"
                className={`px-1.5 sm:px-2 py-1 text-xs font-mono font-bold rounded-lg flex items-center gap-1 shadow-sm shrink-0 transition-colors ${
                  offlineQueueCount > 0 
                    ? 'bg-amber-500 text-slate-950 hover:bg-amber-400' 
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-750 hover:text-slate-200 border border-slate-700'
                }`}
              >
                <span className="hidden sm:inline">{offlineQueueCount > 0 ? 'SYNC' : 'QUEUE'}</span>
                <span>({offlineQueueCount})</span>
              </button>
            </div>

            {/* Active Employee Switcher */}
            <div className="relative group hidden md:block">
              <select
                value={currentUser.id}
                onChange={e => {
                  const emp = employees.find(em => em.id === e.target.value);
                  if (emp) setCurrentUser(emp);
                }}
                className="bg-slate-800 border border-slate-700 text-slate-200 font-medium rounded-lg px-2 sm:px-2.5 py-1 pr-6 text-xs appearance-none cursor-pointer focus:outline-none focus:border-amber-400 hover:bg-slate-750 max-w-[130px] lg:max-w-[160px] truncate"
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

      {/* GLOBAL SEARCH COMMAND MODAL */}
      <GlobalSearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        onNavigateTab={handleSelectTab}
      />

      {/* INDEXEDDB OFFLINE QUEUE & SYNC ENGINE MODAL */}
      <OfflineQueueModal
        isOpen={offlineQueueModalOpen}
        onClose={() => setOfflineQueueModalOpen(false)}
      />

      {/* MOBILE DRAWER OVERLAY (< md) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
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

            {/* Quick Search Button in Mobile Drawer */}
            <div className="p-3 bg-slate-950/40 border-b border-slate-800">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setSearchModalOpen(true);
                }}
                className="w-full flex items-center gap-2.5 p-2 bg-slate-800/80 hover:bg-slate-800 border border-slate-700 rounded-xl text-slate-300 text-xs font-semibold"
              >
                <Search className="w-4 h-4 text-amber-400" />
                <span>Global Lookup & Search</span>
                <span className="ml-auto text-[10px] font-mono text-slate-500 bg-slate-900 px-1.5 py-0.5 rounded">⌘K</span>
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

      {/* MOBILE STICKY BOTTOM NAVIGATION BAR (< md) */}
      <nav className="fixed bottom-0 inset-x-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 md:hidden flex items-center justify-around h-14 px-2 safe-area-bottom no-print">
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
