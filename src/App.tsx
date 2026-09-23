import React, { useState, useEffect } from 'react';
import { ServOSProvider } from './context/ServOSContext';
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

const MainApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('pos');
  const [isHardwareModalOpen, setIsHardwareModalOpen] = useState<boolean>(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('servos_sidebar_collapsed') === 'true';
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

        <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden pb-14 lg:pb-0">
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
