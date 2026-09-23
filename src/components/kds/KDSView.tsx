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
    <div className="flex-1 flex flex-col h-[calc(100vh-60px)] bg-slate-950 overflow-hidden">
      {/* Header bar for KDS */}
      <div className="bg-slate-900 border-b border-slate-800 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ChefHat className="w-5 h-5 text-amber-400" />
          <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
            Kitchen & Bar Display System (KDS Pass)
          </h2>
          <span className="text-xs text-slate-400 font-mono">
            Active Orders: {activeKdsOrders.length}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {['ALL', 'BAR', 'KITCHEN'].map(st => (
            <button
              key={st}
              onClick={() => setStationFilter(st as any)}
              className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors ${
                stationFilter === st
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
              }`}
            >
              {st === 'ALL' ? 'All Stations' : st === 'BAR' ? 'Cocktail & Bar Pass' : 'Grill & Kitchen Pass'}
            </button>
          ))}
        </div>
      </div>

      {/* Tickets Stream */}
      <div className="flex-1 overflow-x-auto p-4 flex gap-4 items-start">
        {activeKdsOrders.length === 0 ? (
          <div className="h-full w-full flex flex-col items-center justify-center text-slate-500">
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
                className="w-80 shrink-0 bg-slate-900 border border-slate-700 rounded-lg shadow-lg overflow-hidden flex flex-col"
              >
                {/* Ticket Header */}
                <div className="p-3 bg-slate-850 border-b border-slate-700 flex justify-between items-start">
                  <div>
                    <div className="text-base font-bold text-white font-mono">
                      {order.tableName || order.tabName || order.orderNumber}
                    </div>
                    <div className="text-xs text-amber-400 font-mono">
                      #{order.orderNumber} · Server: {order.serverName}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                    <Clock className="w-3 h-3 text-amber-400" />
                    <span>8 min ago</span>
                  </div>
                </div>

                {/* Ticket Items */}
                <div className="p-3 space-y-2.5 flex-1 max-h-[400px] overflow-y-auto">
                  {order.items.map((item, idx) => (
                    <div key={item.id || idx} className="p-2 bg-slate-950/60 rounded border border-slate-800">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded bg-amber-500/20 text-amber-400 font-mono font-bold text-xs flex items-center justify-center">
                            {item.quantity}
                          </span>
                          <span className="text-xs font-bold text-slate-100">
                            {item.productName}
                          </span>
                        </div>
                        {item.portionName && (
                          <span className="text-[10px] font-mono text-slate-400">
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
                <div className="p-2.5 bg-slate-850 border-t border-slate-700 flex gap-2">
                  <button
                    onClick={() => alert(`Ticket #${order.orderNumber} bumped to READY & notification sent to ${order.serverName}!`)}
                    className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded flex items-center justify-center gap-1.5 shadow-xs"
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
