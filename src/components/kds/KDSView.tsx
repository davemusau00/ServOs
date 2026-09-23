import React, { useState } from 'react';
import { useServOS } from '../../context/ServOSContext';
import { ChefHat, Clock, CheckCircle, RotateCcw, Flame, Wine } from 'lucide-react';

export const KDSView: React.FC = () => {
  const { orders, tables, bumpKdsTicket, recallKdsTicket } = useServOS();
  const [stationFilter, setStationFilter] = useState<'ALL' | 'BAR' | 'KITCHEN'>('ALL');
  const [kdsMode, setKdsMode] = useState<'ACTIVE' | 'BUMPED'>('ACTIVE');

  // Filter active tickets that need prep
  const activeKdsOrders = orders.filter(o => 
    (o.state === 'SENT' || o.state === 'OPEN') && 
    o.items && 
    o.items.some(i => i.state === 'ROUTED' || i.state === 'PREPARING' || i.state === 'OPEN')
  );

  // Completed/bumped tickets
  const bumpedKdsOrders = orders.filter(o =>
    o.items && o.items.some(i => i.state === 'SERVED')
  );

  const displayedOrders = kdsMode === 'ACTIVE' ? activeKdsOrders : bumpedKdsOrders;

  return (
    <div className="flex-1 h-full min-h-0 flex flex-col bg-slate-950 overflow-hidden">
      {/* Responsive Header Bar for KDS */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-3 sm:px-6 sm:py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 shrink-0">
            <ChefHat className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h2 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider font-mono truncate">
              Kitchen & Bar Display System (KDS Pass)
            </h2>
            <div className="flex items-center gap-2 text-xs text-slate-400 font-mono mt-0.5">
              <span>Active Tickets: <strong className="text-amber-400">{activeKdsOrders.length}</strong></span>
              <span>·</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Live Feed
              </span>
            </div>
          </div>
        </div>

        {/* View Mode & Station Filter */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {/* Active vs Bumped Toggle */}
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setKdsMode('ACTIVE')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                kdsMode === 'ACTIVE'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Active Pass ({activeKdsOrders.length})
            </button>
            <button
              onClick={() => setKdsMode('BUMPED')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                kdsMode === 'BUMPED'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Bumped / History ({bumpedKdsOrders.length})
            </button>
          </div>

          {/* Station Selector */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            {[
              { id: 'ALL', label: 'All Stations' },
              { id: 'BAR', label: 'Bar Pass' },
              { id: 'KITCHEN', label: 'Kitchen Pass' }
            ].map(st => (
              <button
                key={st.id}
                onClick={() => setStationFilter(st.id as any)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                  stationFilter === st.id
                    ? 'bg-slate-800 text-white font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tickets Stream (Scrollable with safe padding for mobile bottom bar) */}
      <div className="flex-1 overflow-x-auto overflow-y-auto p-4 flex flex-col sm:flex-row gap-4 items-stretch sm:items-start pb-24 lg:pb-6">
        {displayedOrders.length === 0 ? (
          <div className="h-full w-full flex flex-col items-center justify-center text-slate-500 py-16">
            <CheckCircle className="w-12 h-12 text-slate-700 mb-2" />
            <p className="text-sm font-semibold text-slate-400">
              {kdsMode === 'ACTIVE' ? 'All passes are clear' : 'No bumped tickets yet'}
            </p>
            <p className="text-xs text-slate-600 mt-1">
              {kdsMode === 'ACTIVE'
                ? 'New orders sent from the POS terminal will appear here in real time.'
                : 'Tickets that have been marked ready will appear here.'}
            </p>
          </div>
        ) : (
          displayedOrders.map(order => {
            const isReady = order.items.every(i => i.state === 'SERVED');
            return (
              <div
                key={order.id}
                className={`w-full sm:w-80 shrink-0 bg-slate-900 border rounded-xl shadow-lg overflow-hidden flex flex-col transition-all ${
                  isReady ? 'border-emerald-800/60 opacity-85' : 'border-slate-750'
                }`}
              >
                {/* Ticket Header */}
                <div className="p-3 bg-slate-850 border-b border-slate-750 flex justify-between items-start">
                  <div>
                    <div className="text-base font-bold text-white font-mono">
                      {order.tableName || order.tabName || order.orderNumber}
                    </div>
                    <div className="text-xs text-amber-400 font-mono">
                      #{order.orderNumber} · Server: {order.serverName}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] font-mono text-slate-300 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                    <Clock className="w-3 h-3 text-amber-400" />
                    <span>Live</span>
                  </div>
                </div>

                {/* Ticket Items */}
                <div className="p-3 space-y-2.5 flex-1 max-h-[380px] overflow-y-auto">
                  {order.items.map((item, idx) => (
                    <div key={item.id || idx} className="p-2.5 bg-slate-950/70 rounded-lg border border-slate-800">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded bg-amber-500/20 text-amber-400 font-mono font-bold text-xs flex items-center justify-center shrink-0">
                            {item.quantity}
                          </span>
                          <span className="text-xs font-bold text-slate-100">
                            {item.productName}
                          </span>
                        </div>
                        {item.portionName && (
                          <span className="text-[10px] font-mono text-slate-400 shrink-0">
                            {item.portionName}
                          </span>
                        )}
                      </div>

                      {item.modifiers.length > 0 && (
                        <div className="mt-1 pl-7 space-y-0.5">
                          {item.modifiers.map(m => (
                            <div key={m.modifierId} className="text-[11px] text-amber-300 font-medium">
                              • {m.name}
                            </div>
                          ))}
                        </div>
                      )}

                      {item.selectedMixers && item.selectedMixers.length > 0 && (
                        <div className="mt-1 pl-7 text-[11px] text-slate-400">
                          Mixers: {item.selectedMixers.join(', ')}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Bump Bar / Action footer */}
                <div className="p-2.5 bg-slate-850 border-t border-slate-750 flex gap-2">
                  {kdsMode === 'ACTIVE' ? (
                    <button
                      onClick={() => bumpKdsTicket(order.id)}
                      className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Bump Ticket (Ready)</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => recallKdsTicket(order.id)}
                      className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 active:scale-[0.98] text-slate-950 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Recall Ticket to Pass</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
