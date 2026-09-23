import React, { useState } from 'react';
import { useServOS } from '../../context/ServOSContext';
import { Clock, CheckCircle, ChefHat, Wine, Bell, Flame } from 'lucide-react';

export const KDSView: React.FC = () => {
  const { orders, tables } = useServOS();
  const [stationFilter, setStationFilter] = useState<'ALL' | 'BAR' | 'KITCHEN'>('ALL');

  // Filter orders that have active items (state SENT or OPEN with items)
  const activeKdsOrders = orders.filter(o => 
    o.state === 'SENT' || o.state === 'OPEN' || (o.items && o.items.some(i => i.state === 'ROUTED' || i.state === 'PREPARING'))
  );

  return (
    <div className="flex-1 h-full min-h-0 flex flex-col bg-slate-950 overflow-hidden">
      {/* Responsive Header Bar for KDS */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-3 sm:px-6 sm:py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-400 shrink-0">
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

        {/* Station Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-0.5 shrink-0">
          {[
            { id: 'ALL', label: 'All Stations' },
            { id: 'BAR', label: 'Cocktail & Bar Pass' },
            { id: 'KITCHEN', label: 'Grill & Kitchen Pass' }
          ].map(st => (
            <button
              key={st.id}
              onClick={() => setStationFilter(st.id as any)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                stationFilter === st.id
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tickets Stream (Scrollable with safe padding for mobile bottom bar) */}
      <div className="flex-1 overflow-x-auto overflow-y-auto p-4 flex flex-col sm:flex-row gap-4 items-stretch sm:items-start pb-24 lg:pb-6">
        {activeKdsOrders.length === 0 ? (
          <div className="h-full w-full flex flex-col items-center justify-center text-slate-500 py-16">
            <CheckCircle className="w-12 h-12 text-slate-700 mb-2" />
            <p className="text-sm font-semibold text-slate-400">All passes are clear</p>
            <p className="text-xs text-slate-600 mt-1">
              New orders sent from the POS terminal will appear here in real time.
            </p>
          </div>
        ) : (
          activeKdsOrders.map(order => {
            const table = order.tableId ? tables.find(t => t.id === order.tableId) : null;
            return (
              <div
                key={order.id}
                className="w-full sm:w-80 shrink-0 bg-slate-900 border border-slate-700/80 rounded-xl shadow-lg overflow-hidden flex flex-col"
              >
                {/* Ticket Header */}
                <div className="p-3 bg-slate-850 border-b border-slate-700/80 flex justify-between items-start">
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
                    <span>8 min ago</span>
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
                <div className="p-2.5 bg-slate-850 border-t border-slate-700/80 flex gap-2">
                  <button
                    onClick={() => alert(`Ticket #${order.orderNumber} bumped to READY & notification sent to ${order.serverName}!`)}
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Bump Ticket (Ready)</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
