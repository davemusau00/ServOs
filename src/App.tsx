import React, { useState, useEffect } from 'react';
import { ServOSProvider, useServOS } from './context/ServOSContext';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { POSView } from './components/pos/POSView';
import { KDSView } from './components/kds/KDSView';
import { HotelPMSView } from './components/hotel/HotelPMSView';
import { InventoryView } from './components/inventory/InventoryView';
import { ProcurementView } from './components/procurement/ProcurementView';
import { AccountingView } from './components/accounting/AccountingView';
import { ControlEngineView } from './components/control/ControlEngineView';
import { StaffCashView } from './components/staff/StaffCashView';
import { EdgeHardwareModal } from './components/edge/EdgeHardwareModal';
import { ToastContainer } from './components/common/ToastContainer';
import { WifiOff, Database, RefreshCw } from 'lucide-react';

const MainApp: React.FC = () => {
  const { isOffline, offlineQueueCount, syncOfflineQueue } = useServOS();
  const [activeTab, setActiveTab] = useState<string>('pos');
  const [isHardwareModalOpen, setIsHardwareModalOpen] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('servos_sidebar_collapsed');
      if (saved !== null) return saved === 'true';
      return typeof window !== 'undefined' && window.innerWidth < 1024;
    } catch {
      return false;
    }
  });

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed(prev => {
      const next = !prev;
      try {
        localStorage.setItem('servos_sidebar_collapsed', String(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const handleBannerSync = async () => {
    setIsSyncing(true);
    await syncOfflineQueue();
    setIsSyncing(false);
  };

  return (
    <div className="min-h-screen h-screen bg-slate-950 text-slate-100 flex flex-row font-sans selection:bg-amber-500 selection:text-slate-950 overflow-hidden">
      {/* Desktop Collapsible Left Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={handleToggleSidebar}
        onOpenHardwareModal={() => setIsHardwareModalOpen(true)}
      />

      {/* Main Viewport & Header */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <Header 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          onOpenHardwareModal={() => setIsHardwareModalOpen(true)} 
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleSidebarCollapse={handleToggleSidebar}
        />

        {/* Persistent Offline Notification Banner */}
        {isOffline && (
          <div className="bg-gradient-to-r from-amber-600/90 via-rose-600/90 to-amber-600/90 text-white px-3 py-1.5 text-xs font-mono flex items-center justify-between shadow-md shrink-0 border-b border-rose-500/30">
            <div className="flex items-center gap-2 min-w-0">
              <WifiOff className="w-3.5 h-3.5 animate-pulse shrink-0" />
              <span className="font-bold shrink-0">OFFLINE MODE ACTIVE:</span>
              <span className="truncate hidden sm:inline">
                All POS sales and stock updates are buffered locally in IndexedDB.
              </span>
              <span className="truncate sm:hidden">
                Buffered in IndexedDB.
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="bg-black/30 px-2 py-0.5 rounded text-[11px] font-bold">
                {offlineQueueCount} queued
              </span>
            </div>
          </div>
        )}

        <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden pb-14 md:pb-0">
          {activeTab === 'pos' && <POSView />}
          {activeTab === 'kds' && <KDSView />}
          {activeTab === 'hotel' && <HotelPMSView />}
          {activeTab === 'inventory' && <InventoryView />}
          {activeTab === 'procurement' && <ProcurementView />}
          {activeTab === 'accounting' && <AccountingView />}
          {activeTab === 'control' && <ControlEngineView />}
          {activeTab === 'staff' && <StaffCashView />}
        </main>
      </div>

      {/* Edge Hardware Inspector Modal */}
      <EdgeHardwareModal 
        isOpen={isHardwareModalOpen} 
        onClose={() => setIsHardwareModalOpen(false)} 
      />

      {/* Global In-App Notifications Toast */}
      <ToastContainer />
    </div>
  );
};

export function App() {
  return (
    <ServOSProvider>
      <MainApp />
    </ServOSProvider>
  );
}

export default App;
