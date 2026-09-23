import React, { useState } from 'react';
import { useServOS } from '../../context/ServOSContext';
import { 
  Printer, 
  Cpu, 
  Scale, 
  Coins, 
  ScanLine, 
  CheckCircle2, 
  Wifi, 
  Play, 
  X,
  FileText
} from 'lucide-react';

interface EdgeHardwareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EdgeHardwareModal: React.FC<EdgeHardwareModalProps> = ({ isOpen, onClose }) => {
  const { edgeDevices, triggerEdgePrint, triggerCashDrawerKick } = useServOS();
  const [testOutput, setTestOutput] = useState<string>('');
  const [scaleReading, setScaleReading] = useState<number>(3.840);
  const [isDrawerKicking, setIsDrawerKicking] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleTestPrint = (deviceName: string) => {
    triggerEdgePrint('RECEIPT', { testDevice: deviceName });
    setTestOutput(
`[ESC/POS THERMAL PRINT EMULATOR - ${deviceName}]
------------------------------------------------
         SERVOS HOSPITALITY SUITE
       VIP Bar Lounge & Dining Room
KRA PIN: P051982736Z  |  CU: KRA-OSCU-NBO-00914
------------------------------------------------
1x Jameson Black Barrel (Double 60ml)    850.00
1x Schweppes Tonic Water 300ml           250.00
------------------------------------------------
Subtotal:                               1,100.00
16% VAT:                                  176.00
2% Catering Levy:                          22.00
TOTAL:                               KES 1,100.00
------------------------------------------------
M-PESA Daraja Ref: QHK482910 [COMPLETED]
QR CODE EMBEDDED: https://itax.kra.go.ke/...
------------------------------------------------
      THANK YOU FOR VISITING SERVOS!`
    );
  };

  const handleKickDrawer = () => {
    setIsDrawerKicking(true);
    triggerCashDrawerKick();
    setTestOutput('>>> ESC/POS Command Sent: 0x1B 0x70 0x00 0x19 0xFA (Drawer Solenoid 24V Kick Pulse Verified)');
    setTimeout(() => setIsDrawerKicking(false), 800);
  };

  const handleSampleScale = () => {
    const weights = [3.840, 4.210, 5.000, 2.760, 0.450];
    const nextWeight = weights[Math.floor(Math.random() * weights.length)];
    setScaleReading(nextWeight);
    setTestOutput(`>>> Scale tare reading captured via RS-232 COM3: ${nextWeight.toFixed(3)} kg`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-2xl w-full shadow-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <Cpu className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="text-base font-bold text-white">Edge LAN Hardware Controller</h3>
              <p className="text-xs text-slate-400 font-mono">
                Direct Ethernet / RS-232 / USB Peripheral Communication Agent
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Devices list */}
        <div className="py-4 space-y-3 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {edgeDevices.map(dev => (
              <div
                key={dev.id}
                className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex items-start justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-200">{dev.name}</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  </div>
                  <div className="text-[11px] font-mono text-slate-400 mt-1">
                    Interface: {dev.connection} · Status: {dev.status}
                  </div>
                  <div className="text-[10px] text-amber-400/90 font-mono mt-0.5">
                    Last Ping: {new Date(dev.lastPing).toLocaleTimeString()}
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  {dev.type === 'RECEIPT_PRINTER' || dev.type === 'KITCHEN_PRINTER' ? (
                    <button
                      onClick={() => handleTestPrint(dev.name)}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold rounded border border-slate-700 flex items-center gap-1"
                    >
                      <Printer className="w-3 h-3 text-amber-400" />
                      <span>Test Print</span>
                    </button>
                  ) : dev.type === 'CASH_DRAWER' ? (
                    <button
                      onClick={handleKickDrawer}
                      className={`px-2.5 py-1 text-slate-200 text-[11px] font-semibold rounded border transition-colors flex items-center gap-1 ${
                        isDrawerKicking ? 'bg-amber-500 text-slate-950 border-amber-400 animate-bounce' : 'bg-slate-800 hover:bg-slate-700 border-slate-700'
                      }`}
                    >
                      <Coins className="w-3 h-3 text-amber-400" />
                      <span>Kick Drawer</span>
                    </button>
                  ) : dev.type === 'WEIGHING_SCALE' ? (
                    <button
                      onClick={handleSampleScale}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold rounded border border-slate-700 flex items-center gap-1"
                    >
                      <Scale className="w-3 h-3 text-amber-400" />
                      <span>Read Tare</span>
                    </button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>

          {/* Scale Weight Banner */}
          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between font-mono">
            <span className="text-xs text-slate-400">Scale Live Sensor Output:</span>
            <div className="text-base font-bold text-amber-300">
              {scaleReading.toFixed(3)} KG <span className="text-xs text-slate-500">(Net Weight)</span>
            </div>
          </div>

          {/* Raw Terminal Output Preview */}
          {testOutput && (
            <div className="mt-2">
              <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider">
                Raw Edge Agent Terminal Stream:
              </span>
              <pre className="mt-1 p-3 bg-slate-950 rounded-lg border border-slate-800 text-[11px] font-mono text-emerald-400 whitespace-pre-wrap max-h-48 overflow-y-auto">
                {testOutput}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex justify-between items-center text-xs text-slate-400 font-mono">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
            <span>Agent v3.1.2 Running on localhost:9876</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded font-medium"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
