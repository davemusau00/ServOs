import React, { useState } from 'react';
import { ServOSProvider } from './context/ServOSContext';
import { Header } from './components/common/Header';
import { POSView } from './components/pos/POSView';
import { KDSView } from './components/kds/KDSView';
import { HotelPMSView } from './components/hotel/HotelPMSView';
import { InventoryView } from './components/inventory/InventoryView';
import { ProcurementView } from './components/procurement/ProcurementView';
import { AccountingView } from './components/accounting/AccountingView';
import { ControlEngineView } from './components/control/ControlEngineView';
import { StaffCashView } from './components/staff/StaffCashView';
import { EdgeHardwareModal } from './components/edge/EdgeHardwareModal';

const MainApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('pos');
  const [isHardwareModalOpen, setIsHardwareModalOpen] = useState<boolean>(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Top Bar Navigation */}
      <Header 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onOpenHardwareModal={() => setIsHardwareModalOpen(true)} 
      />

      {/* Main Viewport Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {activeTab === 'pos' && <POSView />}
        {activeTab === 'kds' && <KDSView />}
        {activeTab === 'hotel' && <HotelPMSView />}
        {activeTab === 'inventory' && <InventoryView />}
        {activeTab === 'procurement' && <ProcurementView />}
        {activeTab === 'accounting' && <AccountingView />}
        {activeTab === 'control' && <ControlEngineView />}
        {activeTab === 'staff' && <StaffCashView />}
      </main>

      {/* Edge Hardware Inspector Modal */}
      <EdgeHardwareModal 
        isOpen={isHardwareModalOpen} 
        onClose={() => setIsHardwareModalOpen(false)} 
      />
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
