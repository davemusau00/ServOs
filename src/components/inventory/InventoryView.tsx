import React, { useState } from 'react';
import { useServOS } from '../../context/ServOSContext';
import { StockItem, StockMovement } from '../../types/servos';
import { 
  Package, 
  ArrowRightLeft, 
  Trash2, 
  Scale, 
  ClipboardCheck, 
  AlertTriangle,
  History,
  TrendingDown,
  Layers,
  X,
  FileSpreadsheet
} from 'lucide-react';

export const InventoryView: React.FC = () => {
  const {
    stockItems,
    stockLocations,
    stockMovements,
    transferStock,
    declareWaste,
    recordStockCountAdjustment
  } = useServOS();

  const [activeTab, setActiveTab] = useState<'ITEMS' | 'MOVEMENTS' | 'AVT'>('ITEMS');

  // Modals
  const [isTransferOpen, setIsTransferOpen] = useState<boolean>(false);
  const [transferItemId, setTransferItemId] = useState<string>('');
  const [transferFromLoc, setTransferFromLoc] = useState<string>('loc-warehouse');
  const [transferToLoc, setTransferToLoc] = useState<string>('loc-bar-store');
  const [transferQty, setTransferQty] = useState<number>(0);
  const [transferReason, setTransferReason] = useState<string>('Weekend Bar Replenishment');

  const [isWasteOpen, setIsWasteOpen] = useState<boolean>(false);
  const [wasteItemId, setWasteItemId] = useState<string>('');
  const [wasteLocationId, setWasteLocationId] = useState<string>('loc-bar-store');
  const [wasteQty, setWasteQty] = useState<number>(0);
  const [wasteReason, setWasteReason] = useState<string>('Broken bottle during service');

  const [isStocktakeOpen, setIsStocktakeOpen] = useState<boolean>(false);
  const [stocktakeItemId, setStocktakeItemId] = useState<string>('');
  const [stocktakeLocId, setStocktakeLocId] = useState<string>('loc-bar-store');
  const [stocktakeCounted, setStocktakeCounted] = useState<number>(0);
  const [stocktakeNotes, setStocktakeNotes] = useState<string>('Weekly shift handover count');

  // Movement filter
  const [movementFilter, setMovementFilter] = useState<string>('ALL');

  const filteredMovements = stockMovements.filter(m => {
    if (movementFilter === 'ALL') return true;
    return m.movementType === movementFilter;
  });

  return (
    <div className="flex-1 h-full min-h-0 flex flex-col bg-slate-950 overflow-hidden">
      {/* Module Header */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-3 sm:px-6 sm:py-3.5 flex flex-col lg:flex-row lg:items-center justify-between gap-3.5 shrink-0">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Package className="w-5 h-5 text-amber-400 shrink-0" />
            <span>Beverage Yield & Inventory Ledger Engine</span>
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-0.5 line-clamp-1">
            Dimensionally-Safe Base Units (ml, g, units), Actual-vs-Theoretical (AvT) & Movement Audits
          </p>
        </div>

        {/* Tab & Action controls */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 overflow-x-auto scrollbar-none">
            <button
              onClick={() => setActiveTab('ITEMS')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'ITEMS'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Stock Items
            </button>
            <button
              onClick={() => setActiveTab('AVT')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'AVT'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              AvT Variance
            </button>
            <button
              onClick={() => setActiveTab('MOVEMENTS')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'MOVEMENTS'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Movements ({stockMovements.length})
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => {
                setTransferItemId(stockItems[0].id);
                setIsTransferOpen(true);
              }}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <ArrowRightLeft className="w-3.5 h-3.5 text-amber-400" />
              <span>Transfer</span>
            </button>

            <button
              onClick={() => {
                setWasteItemId(stockItems[0].id);
                setIsWasteOpen(true);
              }}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
              <span>Waste</span>
            </button>

            <button
              onClick={() => {
                setStocktakeItemId(stockItems[0].id);
                setIsStocktakeOpen(true);
              }}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <ClipboardCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>Count</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 pb-28 lg:pb-8">
        {/* VIEW 1: Stock Items & Levels */}
        {activeTab === 'ITEMS' && (
          <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden shadow-md">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 font-mono uppercase text-[10px] border-b border-slate-800">
                <tr>
                  <th className="p-3">Item Code & Name</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Base Unit</th>
                  <th className="p-3">Unit Cost (KES)</th>
                  <th className="p-3">Warehouse Depot</th>
                  <th className="p-3">Main Bar Store</th>
                  <th className="p-3">Kitchen / Minibar</th>
                  <th className="p-3 text-right">Total Valuation (KES)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 font-mono">
                {stockItems.map(item => {
                  const whStock = item.currentStock['loc-warehouse'] || 0;
                  const barStock = item.currentStock['loc-bar-store'] || 0;
                  const kitStock = (item.currentStock['loc-kitchen-store'] || 0) + (item.currentStock['loc-minibar-depot'] || 0);
                  const totalQty = whStock + barStock + kitStock;
                  const totalValuation = totalQty * item.averageUnitCost;

                  return (
                    <tr key={item.id} className="hover:bg-slate-850">
                      <td className="p-3">
                        <div className="font-bold text-slate-200">{item.name}</div>
                        <div className="text-[10px] text-slate-400">{item.code}</div>
                      </td>
                      <td className="p-3 text-slate-300">
                        {item.category}
                      </td>
                      <td className="p-3">
                        <span className="bg-slate-800 px-2 py-0.5 rounded text-[11px] text-amber-300 font-bold">
                          {item.baseUnit}
                        </span>
                      </td>
                      <td className="p-3 tabular-nums text-slate-300">
                        {item.averageUnitCost.toFixed(2)}
                      </td>
                      <td className="p-3 tabular-nums text-slate-200 font-bold">
                        {whStock.toLocaleString()} {item.baseUnit}
                      </td>
                      <td className="p-3 tabular-nums text-amber-300 font-bold">
                        {barStock.toLocaleString()} {item.baseUnit}
                      </td>
                      <td className="p-3 tabular-nums text-slate-300">
                        {kitStock.toLocaleString()} {item.baseUnit}
                      </td>
                      <td className="p-3 text-right font-bold text-emerald-400 tabular-nums">
                        {Math.round(totalValuation).toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* VIEW 2: Actual vs Theoretical (AvT) Yield Report (Section 13, 27) */}
        {activeTab === 'AVT' && (
          <div className="space-y-4">
            <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-amber-400" />
                  <span>Actual-vs-Theoretical (AvT) Beverage Yield Reconciliation</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Compares POS sale depletions + declared spillage against actual physical bottle/ml counts.
                </p>
              </div>
              <div className="text-xs font-mono bg-amber-500/10 border border-amber-500/30 text-amber-300 px-3 py-1.5 rounded">
                Configured Tolerance: 2.5% of Theoretical
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden shadow-md">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 font-mono uppercase text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="p-3">Stock Item</th>
                    <th className="p-3">Location</th>
                    <th className="p-3">Opening Stock</th>
                    <th className="p-3">POS Theoretical Usage</th>
                    <th className="p-3">Declared Waste</th>
                    <th className="p-3">Expected In-Stock</th>
                    <th className="p-3">Actual Count</th>
                    <th className="p-3">Yield Variance</th>
                    <th className="p-3 text-right">Variance Loss (KES)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-mono">
                  {/* Jameson AvT row with real variance */}
                  <tr className="hover:bg-slate-850">
                    <td className="p-3 font-bold text-slate-200">
                      Jameson Irish Whiskey 750ml
                    </td>
                    <td className="p-3 text-slate-400">Main Bar Beverage Station</td>
                    <td className="p-3 tabular-nums">4,500 ml</td>
                    <td className="p-3 tabular-nums text-amber-300">-210 ml (POS Shots)</td>
                    <td className="p-3 tabular-nums text-rose-350">-90 ml (Spill)</td>
                    <td className="p-3 tabular-nums font-bold">4,200 ml</td>
                    <td className="p-3 tabular-nums font-bold text-slate-100">4,020 ml</td>
                    <td className="p-3">
                      <span className="text-rose-400 font-bold bg-rose-500/20 px-2 py-0.5 rounded">
                        -180 ml (-4.2%)
                      </span>
                    </td>
                    <td className="p-3 text-right font-bold text-rose-400 tabular-nums">
                      -KES 671.40
                    </td>
                  </tr>

                  {/* Tanqueray Gin AvT */}
                  <tr className="hover:bg-slate-850">
                    <td className="p-3 font-bold text-slate-200">
                      Tanqueray London Dry Gin 1000ml
                    </td>
                    <td className="p-3 text-slate-400">Main Bar Beverage Station</td>
                    <td className="p-3 tabular-nums">7,000 ml</td>
                    <td className="p-3 tabular-nums text-amber-300">-200 ml</td>
                    <td className="p-3 tabular-nums text-slate-400">0 ml</td>
                    <td className="p-3 tabular-nums font-bold">6,800 ml</td>
                    <td className="p-3 tabular-nums font-bold text-slate-100">6,800 ml</td>
                    <td className="p-3">
                      <span className="text-emerald-400 font-bold bg-emerald-500/20 px-2 py-0.5 rounded">
                        0 ml (100% Yield)
                      </span>
                    </td>
                    <td className="p-3 text-right font-bold text-emerald-400 tabular-nums">
                      KES 0.00
                    </td>
                  </tr>

                  {/* Tusker Lager AvT */}
                  <tr className="hover:bg-slate-850">
                    <td className="p-3 font-bold text-slate-200">
                      Tusker Lager 500ml
                    </td>
                    <td className="p-3 text-slate-400">Main Bar Beverage Station</td>
                    <td className="p-3 tabular-nums">120 units</td>
                    <td className="p-3 tabular-nums text-amber-300">-24 units</td>
                    <td className="p-3 tabular-nums text-slate-400">0 units</td>
                    <td className="p-3 tabular-nums font-bold">96 units</td>
                    <td className="p-3 tabular-nums font-bold text-slate-100">96 units</td>
                    <td className="p-3">
                      <span className="text-emerald-400 font-bold bg-emerald-500/20 px-2 py-0.5 rounded">
                        0 units (Exact)
                      </span>
                    </td>
                    <td className="p-3 text-right font-bold text-emerald-400 tabular-nums">
                      KES 0.00
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* VIEW 3: Immutable Stock Movement Ledger */}
        {activeTab === 'MOVEMENTS' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {['ALL', 'SALE_CONSUMPTION', 'TRANSFER_IN', 'TRANSFER_OUT', 'WASTE', 'PURCHASE_RECEIPT', 'COUNT_ADJUSTMENT'].map(mvt => (
                  <button
                    key={mvt}
                    onClick={() => setMovementFilter(mvt)}
                    className={`px-3 py-1 text-xs font-semibold rounded transition-colors ${
                      movementFilter === mvt
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
                    }`}
                  >
                    {mvt}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden shadow-md">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 font-mono uppercase text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="p-3">Timestamp</th>
                    <th className="p-3">Item Name</th>
                    <th className="p-3">Location</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Source Ref / Reason</th>
                    <th className="p-3">Quantity Delta</th>
                    <th className="p-3">Cost Snapshot</th>
                    <th className="p-3 text-right">Cost Valuation (KES)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-mono">
                  {filteredMovements.map(m => {
                    const isPositive = m.quantityDelta > 0;
                    return (
                      <tr key={m.id} className="hover:bg-slate-850">
                        <td className="p-3 text-slate-400 text-[11px]">
                          {new Date(m.occurredAt).toLocaleDateString()} {new Date(m.occurredAt).toLocaleTimeString()}
                        </td>
                        <td className="p-3 font-semibold text-slate-200">
                          {m.stockItemName}
                        </td>
                        <td className="p-3 text-slate-400">
                          {m.locationName}
                        </td>
                        <td className="p-3">
                          <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                            m.movementType === 'SALE_CONSUMPTION' ? 'bg-blue-500/20 text-blue-300' :
                            m.movementType === 'PURCHASE_RECEIPT' ? 'bg-emerald-500/20 text-emerald-300' :
                            m.movementType === 'WASTE' ? 'bg-rose-500/20 text-rose-300' :
                            'bg-amber-500/20 text-amber-300'
                          }`}>
                            {m.movementType}
                          </span>
                        </td>
                        <td className="p-3 text-slate-300">
                          {m.sourceId ? `#${m.sourceId} ` : ''}
                          <span className="text-slate-400 text-[11px]">{m.reasonCode}</span>
                        </td>
                        <td className={`p-3 font-bold tabular-nums ${
                          isPositive ? 'text-emerald-400' : 'text-rose-400'
                        }`}>
                          {isPositive ? '+' : ''}{m.quantityDelta} {m.baseUnit}
                        </td>
                        <td className="p-3 text-slate-400 tabular-nums">
                          KES {m.unitCostSnapshot.toFixed(2)}
                        </td>
                        <td className="p-3 text-right font-bold text-slate-200 tabular-nums">
                          {m.totalCostValuation.toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* MODAL: Stock Transfer */}
      {isTransferOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-base font-bold text-white mb-1">Inter-Location Stock Transfer</h3>
            <p className="text-xs text-slate-400 mb-4">Creates paired dispatch/receive movements with zero loss.</p>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-300 block mb-1">Stock Item</label>
                <select
                  value={transferItemId}
                  onChange={e => setTransferItemId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-xs text-white"
                >
                  {stockItems.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} (Base: {s.baseUnit})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-slate-300 block mb-1">From Location</label>
                  <select
                    value={transferFromLoc}
                    onChange={e => setTransferFromLoc(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-xs text-white"
                  >
                    {stockLocations.map(l => (
                      <option key={l.id} value={l.id}>{l.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-300 block mb-1">To Location</label>
                  <select
                    value={transferToLoc}
                    onChange={e => setTransferToLoc(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-xs text-white"
                  >
                    {stockLocations.map(l => (
                      <option key={l.id} value={l.id}>{l.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">Quantity (in Base Unit)</label>
                <input
                  type="number"
                  value={transferQty || ''}
                  onChange={e => setTransferQty(parseFloat(e.target.value) || 0)}
                  placeholder="e.g. 3750 for 5 bottles of 750ml"
                  className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-xs text-amber-300 font-mono"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">Reason / Voucher Note</label>
                <input
                  type="text"
                  value={transferReason}
                  onChange={e => setTransferReason(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  onClick={() => setIsTransferOpen(false)}
                  className="px-4 py-2 text-xs text-slate-400"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (transferQty > 0) {
                      transferStock(transferItemId, transferFromLoc, transferToLoc, transferQty, transferReason);
                      setIsTransferOpen(false);
                      alert('Stock transfer completed and ledger updated!');
                    }
                  }}
                  className="px-5 py-2 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded"
                >
                  Confirm Transfer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Declare Waste */}
      {isWasteOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-base font-bold text-white mb-1">Record Waste / Spillage</h3>
            <p className="text-xs text-slate-400 mb-4">
              Write off lost stock and automatically post to General Ledger Waste Expense (5050).
            </p>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-300 block mb-1">Stock Item</label>
                <select
                  value={wasteItemId}
                  onChange={e => setWasteItemId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-xs text-white"
                >
                  {stockItems.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">Waste Quantity (in Base Unit)</label>
                <input
                  type="number"
                  value={wasteQty || ''}
                  onChange={e => setWasteQty(parseFloat(e.target.value) || 0)}
                  placeholder="e.g. 60 ml or 1 unit"
                  className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-xs text-rose-300 font-mono"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">Reason Code</label>
                <input
                  type="text"
                  value={wasteReason}
                  onChange={e => setWasteReason(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  onClick={() => setIsWasteOpen(false)}
                  className="px-4 py-2 text-xs text-slate-400"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (wasteQty > 0) {
                      declareWaste(wasteItemId, wasteLocationId, wasteQty, wasteReason);
                      setIsWasteOpen(false);
                      alert('Waste declared and posted to General Ledger Expense!');
                    }
                  }}
                  className="px-5 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white rounded"
                >
                  Post Waste
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Stock Count Adjustment */}
      {isStocktakeOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-base font-bold text-white mb-1">Physical Stocktake Count</h3>
            <p className="text-xs text-slate-400 mb-4">
              A count does not overwrite the ledger; it logs a count adjustment movement for the variance.
            </p>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-300 block mb-1">Stock Item</label>
                <select
                  value={stocktakeItemId}
                  onChange={e => setStocktakeItemId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-xs text-white"
                >
                  {stockItems.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">Counted Quantity in Base Unit</label>
                <input
                  type="number"
                  value={stocktakeCounted || ''}
                  onChange={e => setStocktakeCounted(parseFloat(e.target.value) || 0)}
                  placeholder="e.g. 4200 ml"
                  className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-xs text-cyan-300 font-mono"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">Count Notes</label>
                <input
                  type="text"
                  value={stocktakeNotes}
                  onChange={e => setStocktakeNotes(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  onClick={() => setIsStocktakeOpen(false)}
                  className="px-4 py-2 text-xs text-slate-400"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    recordStockCountAdjustment(stocktakeItemId, stocktakeLocId, stocktakeCounted, stocktakeNotes);
                    setIsStocktakeOpen(false);
                    alert('Physical count recorded and variance movement created!');
                  }}
                  className="px-5 py-2 text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white rounded"
                >
                  Record Count
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
