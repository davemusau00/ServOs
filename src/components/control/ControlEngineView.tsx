import React, { useState } from 'react';
import { useServOS } from '../../context/ServOSContext';
import { 
  ShieldAlert, 
  Search, 
  CheckCircle, 
  AlertTriangle, 
  ArrowRight, 
  Clock, 
  Layers, 
  Receipt, 
  Coins, 
  Package, 
  Scale, 
  QrCode,
  UserCheck,
  Check,
  X
} from 'lucide-react';

export const ControlEngineView: React.FC = () => {
  const {
    traceEvidence,
    anomalyAlerts,
    resolveAlert,
    approvalRequests,
    handleApproval
  } = useServOS();

  const [activeTab, setActiveTab] = useState<'NORTHSTAR' | 'ALERTS' | 'APPROVALS'>('NORTHSTAR');
  const [searchQuery, setSearchQuery] = useState<string>('ORD-9020');
  const [traceResult, setTraceResult] = useState<any>(() => traceEvidence('ORD-9020'));

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const res = traceEvidence(searchQuery.trim());
    setTraceResult(res);
  };

  const openAlerts = anomalyAlerts.filter(a => a.status === 'OPEN');
  const pendingApprovals = approvalRequests.filter(a => a.status === 'PENDING');

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-60px)] bg-slate-950 overflow-hidden">
      {/* Header */}
      <div className="bg-slate-900 border-b border-slate-800 px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-400" />
            <span>Control Engine & North Star Audit Console</span>
          </h2>
          <p className="text-xs text-slate-400 font-mono">
            Full-Life Traceability from POS Order → KDS → M-PESA → eTIMS → Stock Depletion → General Ledger
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setActiveTab('NORTHSTAR')}
              className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors ${
                activeTab === 'NORTHSTAR' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              North Star Traceability
            </button>
            <button
              onClick={() => setActiveTab('ALERTS')}
              className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors flex items-center gap-1.5 ${
                activeTab === 'ALERTS' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>Anomaly Alerts</span>
              {openAlerts.length > 0 && (
                <span className="px-1.5 py-0.2 text-[10px] bg-rose-500 text-white rounded-full font-bold">
                  {openAlerts.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('APPROVALS')}
              className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors flex items-center gap-1.5 ${
                activeTab === 'APPROVALS' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>Manager Approvals</span>
              {pendingApprovals.length > 0 && (
                <span className="px-1.5 py-0.2 text-[10px] bg-amber-500 text-slate-950 rounded-full font-bold">
                  {pendingApprovals.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* VIEW 1: The North Star Traceability Console (Section 29) */}
        {activeTab === 'NORTHSTAR' && (
          <div className="space-y-6 max-w-5xl mx-auto">
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Query any identifier: Order # (e.g. ORD-9020), Item (e.g. Jameson), Room (e.g. 101), or Account (1020)..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-mono"
                />
              </div>
              <button
                type="submit"
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-lg shadow-sm"
              >
                Trace Lifecycle
              </button>
            </form>

            {/* Traceability Graph Flow */}
            {traceResult && traceResult.type !== 'NONE' ? (
              <div className="space-y-4">
                <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wider font-bold">
                        Trace Result: {traceResult.type} MATCH FOUND
                      </span>
                      <h3 className="text-base font-bold text-white mt-0.5">
                        Lifecycle Audit Trail & Correlated Evidence
                      </h3>
                    </div>
                    <span className="text-xs font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2.5 py-1 rounded">
                      Auditable: 100% Deterministic
                    </span>
                  </div>
                </div>

                {/* Step 1: POS Order */}
                {traceResult.order && (
                  <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-xs font-bold text-amber-400 font-mono mb-2">
                      <span className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center text-[11px]">1</span>
                      <span>POS Order Inception</span>
                    </div>
                    <div className="p-3 bg-slate-950 rounded border border-slate-800 text-xs font-mono space-y-1">
                      <div className="flex justify-between text-slate-200">
                        <span className="font-bold">{traceResult.order.orderNumber} ({traceResult.order.tableName || traceResult.order.tabName})</span>
                        <span className="text-amber-300">KES {traceResult.order.grandTotal.toLocaleString()}</span>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Server: {traceResult.order.serverName} · State: {traceResult.order.state} · Outlet: Main Bar Lounge
                      </div>
                      <div className="pt-1 text-[11px] text-slate-300">
                        Items: {traceResult.order.items.map((i: any) => `${i.quantity}x ${i.productName} (${i.portionName || 'Standard'})`).join(', ')}
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Payment & Daraja M-PESA */}
                <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 font-mono mb-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-[11px]">2</span>
                    <span>Tender & Payment Settlement</span>
                  </div>
                  <div className="p-3 bg-slate-950 rounded border border-slate-800 text-xs font-mono space-y-1">
                    <div className="flex justify-between text-slate-200">
                      <span>Method: {traceResult.payment?.tenderType || 'SAFARICOM M-PESA'}</span>
                      <span className="text-emerald-400 font-bold">
                        Daraja Ref: {traceResult.payment?.mpesaReceiptNumber || 'QHK482910'}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Amount: KES {(traceResult.payment?.amount || traceResult.order?.grandTotal || 9500).toLocaleString()} · Status: SETTLED
                    </div>
                  </div>
                </div>

                {/* Step 3: KRA eTIMS Fiscal Submission */}
                {traceResult.fiscalInvoice && (
                  <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 font-mono mb-2">
                      <span className="w-5 h-5 rounded-full bg-cyan-500/20 flex items-center justify-center text-[11px]">3</span>
                      <span>KRA eTIMS Fiscal Clearance</span>
                    </div>
                    <div className="p-3 bg-slate-950 rounded border border-slate-800 text-xs font-mono space-y-1">
                      <div className="flex justify-between text-slate-200">
                        <span className="font-bold">{traceResult.fiscalInvoice.invoiceNumber}</span>
                        <span className="text-cyan-300">CU: {traceResult.fiscalInvoice.cuSerialNumber}</span>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Tax Base: KES {traceResult.fiscalInvoice.taxableAmount.toLocaleString()} | 16% VAT: KES {traceResult.fiscalInvoice.vatAmount.toLocaleString()} | 2% Catering: KES {traceResult.fiscalInvoice.levyAmount.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">
                        Verification Hash: {traceResult.fiscalInvoice.verificationHash}
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 4: Dimensionally-Safe Stock Movements */}
                {traceResult.movements && traceResult.movements.length > 0 && (
                  <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-xs font-bold text-purple-400 font-mono mb-2">
                      <span className="w-5 h-5 rounded-full bg-purple-500/20 flex items-center justify-center text-[11px]">4</span>
                      <span>Physical Stock Depletion Ledger</span>
                    </div>
                    <div className="space-y-2">
                      {traceResult.movements.map((m: any) => (
                        <div key={m.id} className="p-3 bg-slate-950 rounded border border-slate-800 text-xs font-mono flex items-center justify-between">
                          <div>
                            <span className="font-bold text-slate-200">{m.stockItemName}</span>
                            <span className="text-[11px] text-slate-400 ml-2">({m.locationName})</span>
                            <div className="text-[11px] text-slate-400 mt-0.5">
                              Type: {m.movementType} · Cost snapshot: KES {m.unitCostSnapshot.toFixed(2)}/unit
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-rose-400 font-bold tabular-nums">
                              {m.quantityDelta} {m.baseUnit}
                            </span>
                            <div className="text-[10px] text-slate-400">
                              Valuation: KES {m.totalCostValuation.toFixed(2)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 5: Double-Entry General Ledger Journal */}
                {traceResult.journalEntry && (
                  <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-xs font-bold text-blue-400 font-mono mb-2">
                      <span className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center text-[11px]">5</span>
                      <span>General Ledger Journal Posting</span>
                    </div>
                    <div className="p-3 bg-slate-950 rounded border border-slate-800 text-xs font-mono space-y-2">
                      <div className="flex justify-between text-slate-200">
                        <span className="font-bold">{traceResult.journalEntry.entryNumber} — {traceResult.journalEntry.memo}</span>
                        <span className="text-emerald-400 font-bold">BALANCED (KES {traceResult.journalEntry.totalDebit.toLocaleString()})</span>
                      </div>
                      <div className="space-y-1 pt-1 border-t border-slate-850">
                        {traceResult.journalEntry.lines.map((l: any) => (
                          <div key={l.id} className="flex justify-between text-[11px]">
                            <span className="text-slate-400">{l.accountCode} - {l.accountName}</span>
                            <span className="tabular-nums">
                              {l.debit > 0 ? `Dr. KES ${l.debit.toLocaleString()}` : `Cr. KES ${l.credit.toLocaleString()}`}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-8 text-center text-slate-500 bg-slate-900/40 rounded-lg border border-slate-800 font-mono text-xs">
                No matching record found for query "{searchQuery}". Try searching "ORD-9020" or "Jameson" or "101".
              </div>
            )}
          </div>
        )}

        {/* VIEW 2: Anomaly Alerts */}
        {activeTab === 'ALERTS' && (
          <div className="space-y-3">
            {anomalyAlerts.map(alert => {
              const isOpen = alert.status === 'OPEN';
              return (
                <div
                  key={alert.id}
                  className={`p-4 rounded-lg border flex items-start justify-between gap-4 ${
                    isOpen ? 'bg-slate-900 border-rose-500/30' : 'bg-slate-900/60 border-slate-800 opacity-60'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <AlertTriangle className={`w-5 h-5 shrink-0 mt-0.5 ${
                      alert.severity === 'CRITICAL' ? 'text-rose-500' :
                      alert.severity === 'HIGH' ? 'text-rose-400' : 'text-amber-400'
                    }`} />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white">{alert.title}</span>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                          alert.severity === 'CRITICAL' ? 'bg-rose-500/20 text-rose-300' :
                          alert.severity === 'HIGH' ? 'bg-rose-500/20 text-rose-300' :
                          'bg-amber-500/20 text-amber-300'
                        }`}>
                          {alert.severity}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          {alert.ruleCode}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-1">{alert.description}</p>
                      <div className="text-[11px] font-mono text-slate-400 mt-2 bg-slate-950 p-2 rounded border border-slate-800">
                        Evidence Details: {JSON.stringify(alert.evidence)}
                      </div>
                    </div>
                  </div>

                  {isOpen && (
                    <button
                      onClick={() => resolveAlert(alert.id, 'Acknowledged and verified by manager on duty')}
                      className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded border border-slate-700 shrink-0"
                    >
                      Acknowledge & Resolve
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* VIEW 3: Manager Approval Queue */}
        {activeTab === 'APPROVALS' && (
          <div className="space-y-3">
            {approvalRequests.length === 0 ? (
              <div className="text-center py-12 text-slate-500 font-mono text-xs">
                No approval requests in the pipeline.
              </div>
            ) : (
              approvalRequests.map(req => {
                const isPending = req.status === 'PENDING';
                return (
                  <div
                    key={req.id}
                    className="p-4 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white font-mono">{req.actionType}</span>
                        {req.amount !== undefined && (
                          <span className="text-xs text-amber-400 font-mono">Amount: KES {req.amount.toLocaleString()}</span>
                        )}
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                          isPending ? 'bg-amber-500/20 text-amber-300' :
                          req.status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-300' :
                          'bg-rose-500/20 text-rose-300'
                        }`}>
                          {req.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-1">Details: {req.details}</p>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                        Requested by: {req.requesterName} · Target ID: #{req.targetId}
                      </p>
                    </div>

                    {isPending && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleApproval(req.id, false, 'Rejected by supervisor')}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-rose-400 text-xs font-bold rounded border border-slate-700 flex items-center gap-1"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>
                        <button
                          onClick={() => handleApproval(req.id, true, 'Approved by supervisor')}
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded flex items-center gap-1 shadow-sm"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Approve & Authorize</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
};
