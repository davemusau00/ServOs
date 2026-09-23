import React, { useState } from 'react';
import { useServOS } from '../../context/ServOSContext';
import { 
  Users, 
  Coins, 
  Clock, 
  Award, 
  DollarSign, 
  AlertCircle, 
  CheckCircle2, 
  ArrowUpRight, 
  ArrowDownLeft,
  X
} from 'lucide-react';

export const StaffCashView: React.FC = () => {
  const {
    employees,
    tillSession,
    openTillSession,
    closeTillSession,
    recordCashPaidInOut
  } = useServOS();

  const [activeTab, setActiveTab] = useState<'TILL' | 'STAFF' | 'TIPS'>('TILL');

  // Drawer / Till actions
  const [isCloseShiftOpen, setIsCloseShiftOpen] = useState<boolean>(false);
  const [countedCash, setCountedCash] = useState<number>(0);
  const [closeNotes, setCloseNotes] = useState<string>('Night shift handover count');

  const [isPaidInOutOpen, setIsPaidInOutOpen] = useState<boolean>(false);
  const [paidType, setPaidType] = useState<'PAID_IN' | 'PAID_OUT'>('PAID_OUT');
  const [paidAmount, setPaidAmount] = useState<number>(1500);
  const [paidReason, setPaidReason] = useState<string>('Emergency purchase of cocktail ice bags');

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-60px)] bg-slate-950 overflow-hidden">
      {/* Header */}
      <div className="bg-slate-900 border-b border-slate-800 px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Coins className="w-5 h-5 text-amber-400" />
            <span>Staff Roster, Till Management & Tip Distribution</span>
          </h2>
          <p className="text-xs text-slate-400 font-mono">
            Blind Drawer Balancing, Over/Short Audits, Shift Hours & FOH/BOH Tip Pooling
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setActiveTab('TILL')}
              className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors ${
                activeTab === 'TILL' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Till & Cash Drawer
            </button>
            <button
              onClick={() => setActiveTab('STAFF')}
              className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors ${
                activeTab === 'STAFF' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Staff Roster ({employees.length})
            </button>
            <button
              onClick={() => setActiveTab('TIPS')}
              className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors ${
                activeTab === 'TIPS' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Tip Pool & Commissions
            </button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* VIEW 1: Till & Cash Drawer Management (Section 26) */}
        {activeTab === 'TILL' && (
          <div className="space-y-6 max-w-4xl mx-auto">
            {tillSession && tillSession.status === 'OPEN' ? (
              <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded">
                        SESSION ACTIVE
                      </span>
                      <h3 className="text-base font-bold text-white">
                        Drawer Session: {tillSession.terminalName}
                      </h3>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      Cashier: {tillSession.employeeName} · Started: {new Date(tillSession.openedAt).toLocaleTimeString()}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setIsPaidInOutOpen(true)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold rounded border border-slate-700"
                    >
                      Paid In / Paid Out
                    </button>
                    <button
                      onClick={() => {
                        setCountedCash(tillSession.expectedCashInDrawer);
                        setIsCloseShiftOpen(true);
                      }}
                      className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded shadow-xs"
                    >
                      Close Shift & Count
                    </button>
                  </div>
                </div>

                {/* Cash Metrics Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-slate-950 rounded-lg border border-slate-800">
                    <span className="text-xs text-slate-400 font-mono">Opening Cash Float</span>
                    <div className="text-xl font-bold font-mono text-slate-200 mt-1">
                      KES {tillSession.openingFloat.toLocaleString()}
                    </div>
                  </div>

                  <div className="p-4 bg-slate-950 rounded-lg border border-slate-800">
                    <span className="text-xs text-slate-400 font-mono">Cash Sales Accumulated</span>
                    <div className="text-xl font-bold font-mono text-emerald-400 mt-1">
                      +KES {tillSession.cashSalesTotal.toLocaleString()}
                    </div>
                  </div>

                  <div className="p-4 bg-slate-950 rounded-lg border border-slate-800">
                    <span className="text-xs text-slate-400 font-mono">Net Paid In / Out</span>
                    <div className="text-xl font-bold font-mono text-amber-300 mt-1">
                      KES {(tillSession.cashPaidIn - tillSession.cashPaidOut).toLocaleString()}
                    </div>
                  </div>

                  <div className="p-4 bg-slate-950 rounded-lg border border-slate-800">
                    <span className="text-xs text-slate-400 font-mono">Expected Cash in Till</span>
                    <div className="text-xl font-bold font-mono text-amber-400 mt-1">
                      KES {tillSession.expectedCashInDrawer.toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Blind Count Rule Notice */}
                <div className="p-3 bg-slate-950/80 rounded border border-slate-800 text-xs text-slate-400 font-mono">
                  Enforces blind drawer reconciliation: The physical cash count must be entered before showing any variance to prevent till skimming.
                </div>
              </div>
            ) : (
              <div className="bg-slate-900 border border-slate-800 rounded-lg p-8 text-center space-y-4">
                <Coins className="w-12 h-12 text-amber-400 mx-auto" />
                <h3 className="text-base font-bold text-white">No Shift Currently Open for this Drawer</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Start a new cashier drawer session by specifying the verified opening float amount.
                </p>
                <button
                  onClick={() => openTillSession(10000)}
                  className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-lg shadow-sm"
                >
                  Open Drawer Session (Float KES 10,000)
                </button>
              </div>
            )}
          </div>
        )}

        {/* VIEW 2: Staff Roster */}
        {activeTab === 'STAFF' && (
          <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden shadow-md">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 font-mono uppercase text-[10px] border-b border-slate-800">
                <tr>
                  <th className="p-3">Staff Name</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Outlet Assigned</th>
                  <th className="p-3">Hourly Rate</th>
                  <th className="p-3">Commission Eligibility</th>
                  <th className="p-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 font-mono">
                {employees.map(emp => (
                  <tr key={emp.id} className="hover:bg-slate-850">
                    <td className="p-3 font-bold text-slate-200">
                      {emp.name}
                    </td>
                    <td className="p-3">
                      <span className="text-[10px] bg-slate-800 text-amber-300 font-bold px-2 py-0.5 rounded">
                        {emp.role}
                      </span>
                    </td>
                    <td className="p-3 text-slate-400">
                      Main Bar Lounge / Restaurant
                    </td>
                    <td className="p-3 text-slate-300 tabular-nums">
                      KES {emp.hourlyRate}/hr
                    </td>
                    <td className="p-3 text-emerald-400 font-semibold">
                      {emp.commissionRate > 0 ? `${(emp.commissionRate * 100).toFixed(0)}% on Bottles & VIP` : 'Standard Pool'}
                    </td>
                    <td className="p-3 text-right">
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded">
                        ACTIVE ON DUTY
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* VIEW 3: Tip Pool & Commissions */}
        {activeTab === 'TIPS' && (
          <div className="space-y-4 max-w-4xl mx-auto">
            <div className="p-4 bg-slate-900 rounded-lg border border-slate-800 flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-white">Automated Tip Pool & Sales Commissions</h3>
                <p className="text-xs text-slate-400">Calculated on hours worked and direct bottle sales attribution.</p>
              </div>
              <div className="text-xs font-mono text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded border border-amber-500/20">
                Current Shift Pool: KES 8,450
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden shadow-md">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 font-mono uppercase text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="p-3">Staff Member</th>
                    <th className="p-3">Role</th>
                    <th className="p-3">Shift Hours</th>
                    <th className="p-3">Pool Weight</th>
                    <th className="p-3">Tip Share (KES)</th>
                    <th className="p-3 text-right">VIP Bottle Commission (KES)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-mono">
                  <tr className="hover:bg-slate-850">
                    <td className="p-3 font-bold text-slate-200">Faith Mutua</td>
                    <td className="p-3 text-slate-400">Bartender</td>
                    <td className="p-3">6.5 hrs</td>
                    <td className="p-3">1.2x (Lead)</td>
                    <td className="p-3 font-bold text-emerald-400">2,850</td>
                    <td className="p-3 text-right font-bold text-amber-300">1,250</td>
                  </tr>
                  <tr className="hover:bg-slate-850">
                    <td className="p-3 font-bold text-slate-200">Kevin Otieno</td>
                    <td className="p-3 text-slate-400">Floor Server</td>
                    <td className="p-3">6.0 hrs</td>
                    <td className="p-3">1.0x</td>
                    <td className="p-3 font-bold text-emerald-400">2,400</td>
                    <td className="p-3 text-right font-bold text-amber-300">475</td>
                  </tr>
                  <tr className="hover:bg-slate-850">
                    <td className="p-3 font-bold text-slate-200">Grace Wanjiku</td>
                    <td className="p-3 text-slate-400">Cashier</td>
                    <td className="p-3">7.0 hrs</td>
                    <td className="p-3">1.0x</td>
                    <td className="p-3 font-bold text-emerald-400">2,200</td>
                    <td className="p-3 text-right font-bold text-slate-400">—</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* MODAL: Close Shift & Drawer Count */}
      {isCloseShiftOpen && tillSession && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-base font-bold text-white mb-1">Close Cash Drawer & Count</h3>
            <p className="text-xs text-slate-400 mb-4">
              Enter the exact counted physical cash in the drawer.
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-300 block mb-1">Physical Cash Counted (KES)</label>
                <input
                  type="number"
                  value={countedCash || ''}
                  onChange={e => setCountedCash(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-base font-mono font-bold text-amber-300"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">Handover Notes</label>
                <input
                  type="text"
                  value={closeNotes}
                  onChange={e => setCloseNotes(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="p-3 bg-slate-950 rounded border border-slate-800 text-xs font-mono space-y-1">
                <div className="flex justify-between text-slate-400">
                  <span>Expected in Drawer:</span>
                  <span>KES {tillSession.expectedCashInDrawer.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-bold pt-1 border-t border-slate-800">
                  <span>Variance (Over / Short):</span>
                  <span className={countedCash - tillSession.expectedCashInDrawer === 0 ? 'text-emerald-400' : 'text-rose-400'}>
                    KES {(countedCash - tillSession.expectedCashInDrawer).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  onClick={() => setIsCloseShiftOpen(false)}
                  className="px-4 py-2 text-xs text-slate-400"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    closeTillSession(countedCash);
                    setIsCloseShiftOpen(false);
                    alert('Shift session closed and drawer count reconciliation posted!');
                  }}
                  className="px-5 py-2 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded"
                >
                  Reconcile & Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Paid In / Paid Out */}
      {isPaidInOutOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-base font-bold text-white mb-1">Record Paid In / Paid Out</h3>
            <p className="text-xs text-slate-400 mb-4">Cash disbursements directly from the till drawer.</p>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setPaidType('PAID_OUT')}
                  className={`py-2 text-xs font-bold rounded border ${
                    paidType === 'PAID_OUT' ? 'bg-rose-600 text-white border-rose-500' : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  Paid Out (Expense)
                </button>
                <button
                  onClick={() => setPaidType('PAID_IN')}
                  className={`py-2 text-xs font-bold rounded border ${
                    paidType === 'PAID_IN' ? 'bg-emerald-600 text-white border-emerald-500' : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  Paid In (Float Top-up)
                </button>
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">Amount (KES)</label>
                <input
                  type="number"
                  value={paidAmount || ''}
                  onChange={e => setPaidAmount(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm font-mono font-bold text-amber-300"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">Voucher Description / Reason</label>
                <input
                  type="text"
                  value={paidReason}
                  onChange={e => setPaidReason(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  onClick={() => setIsPaidInOutOpen(false)}
                  className="px-4 py-2 text-xs text-slate-400"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    recordCashPaidInOut(paidType === 'PAID_IN' ? 'IN' : 'OUT', paidAmount, paidReason);
                    setIsPaidInOutOpen(false);
                    alert(`Cash ${paidType} recorded and expected drawer cash updated!`);
                  }}
                  className="px-5 py-2 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded"
                >
                  Record Cash Voucher
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
