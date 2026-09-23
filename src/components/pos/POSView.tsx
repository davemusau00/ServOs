import React, { useState } from 'react';
import { useServOS } from '../../context/ServOSContext';
import { ProductSellable, RestaurantTable, OrderItem } from '../../types/servos';
import { 
  Wine, 
  Beer, 
  Flame, 
  Sparkles, 
  Send, 
  Trash2, 
  Plus, 
  Minus, 
  CreditCard, 
  Smartphone, 
  Coins, 
  Bed, 
  CheckCircle2, 
  AlertCircle,
  FileText,
  Percent,
  Gift,
  X,
  QrCode,
  DollarSign
} from 'lucide-react';

export const POSView: React.FC = () => {
  const {
    products,
    tables,
    activeOrder,
    orders,
    createOrderForTable,
    createQuickBarTab,
    selectOrder,
    addItemToOrder,
    removeItemFromOrder,
    sendOrderToKitchenAndBar,
    applyCompToItem,
    applyOrderDiscount,
    voidOrder,
    processPayment,
    guestStays,
    guestFolios,
    currentUser,
    currentOutlet,
    isOffline
  } = useServOS();

  // Filter state
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  
  // Modals state
  const [activePortionProduct, setActivePortionProduct] = useState<ProductSellable | null>(null);
  const [activeModifierProduct, setActiveModifierProduct] = useState<ProductSellable | null>(null);
  const [selectedModifiers, setSelectedModifiers] = useState<string[]>([]);
  const [selectedMixers, setSelectedMixers] = useState<string[]>([]);

  // Payment checkout modal
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [tenderType, setTenderType] = useState<'CASH' | 'MPESA' | 'CARD' | 'ROOM_CHARGE'>('MPESA');
  const [mpesaPhone, setMpesaPhone] = useState<string>('0722419802');
  const [cashTendered, setCashTendered] = useState<number>(0);
  const [selectedGuestStayId, setSelectedGuestStayId] = useState<string>('');
  const [cardAuthCode, setCardAuthCode] = useState<string>('748192');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [darajaStep, setDarajaStep] = useState<string>('');
  const [paymentResult, setPaymentResult] = useState<{ success: boolean; message: string; receipt?: string } | null>(null);

  // Discount / Comp modal
  const [isCompModalOpen, setIsCompModalOpen] = useState<boolean>(false);
  const [compTargetItemId, setCompTargetItemId] = useState<string>('');
  const [compReason, setCompReason] = useState<string>('VIP House Hospitality');

  // Filter products by current category & outlet
  const filteredProducts = products.filter(p => {
    const outletMatch = p.outletIds.includes(currentOutlet.id);
    if (!outletMatch) return false;
    if (selectedCategory === 'ALL') return true;
    return p.category === selectedCategory;
  });

  const categories = [
    { id: 'ALL', label: 'All Items' },
    { id: 'SPIRITS', label: 'Spirits & Shots' },
    { id: 'COCKTAIL', label: 'Cocktails' },
    { id: 'BEER', label: 'Beer & Cider' },
    { id: 'PACKAGE', label: 'VIP Packages' },
    { id: 'FOOD', label: 'Grill & Kitchen' }
  ];

  // Helper when clicking product
  const handleProductClick = (prod: ProductSellable) => {
    if (prod.category === 'SPIRITS' && prod.code.startsWith('JAM-')) {
      // Let user choose between Shot, Double, or Bottle
      setActivePortionProduct(prod);
      return;
    }

    if (prod.modifiers && prod.modifiers.length > 0) {
      // Has customizable recipe modifiers
      setActiveModifierProduct(prod);
      setSelectedModifiers([]);
      return;
    }

    if (prod.productType === 'PACKAGE' && prod.packageMixersCount) {
      setActiveModifierProduct(prod);
      setSelectedMixers(['Schweppes Tonic Can (2x)', 'Ginger Ale Can (2x)']);
      return;
    }

    addItemToOrder(prod.id);
  };

  const handleConfirmModifiers = () => {
    if (!activeModifierProduct) return;
    const mods = (activeModifierProduct.modifiers || [])
      .filter(m => selectedModifiers.includes(m.id))
      .map(m => ({ modifierId: m.id, name: m.name, priceDelta: m.priceDelta }));

    addItemToOrder(activeModifierProduct.id, undefined, mods, selectedMixers);
    setActiveModifierProduct(null);
    setSelectedModifiers([]);
    setSelectedMixers([]);
  };

  const handleExecutePayment = async () => {
    if (!activeOrder) return;
    setIsProcessing(true);
    setPaymentResult(null);

    if (tenderType === 'MPESA') {
      setDarajaStep('1/3 Contacting Safaricom Daraja API...');
      await new Promise(r => setTimeout(r, 600));
      setDarajaStep('2/3 STK Push prompt sent to handset ' + mpesaPhone + '...');
      await new Promise(r => setTimeout(r, 800));
      setDarajaStep('3/3 Customer verified PIN. Capturing C2B callback...');
      await new Promise(r => setTimeout(r, 600));
    }

    const res = await processPayment(activeOrder.id, tenderType, activeOrder.grandTotal, {
      phoneNumber: mpesaPhone,
      cashTendered: cashTendered || activeOrder.grandTotal,
      guestStayId: selectedGuestStayId,
      cardAuthCode
    });

    setIsProcessing(false);
    setDarajaStep('');
    setPaymentResult(res);
  };

  const activeTable = activeOrder?.tableId
    ? tables.find(t => t.id === activeOrder.tableId)
    : null;

  return (
    <div className="flex-1 flex flex-col lg:flex-row h-[calc(100vh-60px)] overflow-hidden bg-slate-950">
      {/* LEFT: Floorplan / Tables Bar + Catalog Grid */}
      <div className="flex-1 flex flex-col overflow-hidden border-r border-slate-800">
        {/* Table & Tab Strip */}
        <div className="bg-slate-900/60 p-2.5 border-b border-slate-800 flex items-center justify-between gap-3 overflow-x-auto scrollbar-none shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono mr-1">
              Tables:
            </span>
            {tables.map(tbl => {
              const isCurrent = activeOrder?.tableId === tbl.id;
              const hasOrder = !!tbl.currentOrderId;
              return (
                <button
                  key={tbl.id}
                  onClick={() => {
                    if (tbl.currentOrderId) {
                      selectOrder(tbl.currentOrderId);
                    } else {
                      createOrderForTable(tbl.id);
                    }
                  }}
                  className={`px-3 py-1.5 rounded text-xs font-semibold whitespace-nowrap transition-all border ${
                    isCurrent
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm'
                      : hasOrder
                      ? 'bg-slate-800 text-slate-200 border-slate-700 hover:border-slate-500'
                      : 'bg-slate-900 text-slate-400 border-slate-800/80 hover:text-slate-300 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span>{tbl.label}</span>
                    {tbl.minimumSpend && (
                      <span className="text-[9px] font-mono font-normal text-amber-400/80">
                        (Min KES 50k)
                      </span>
                    )}
                    {hasOrder && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => createQuickBarTab(`Walk-in Tab #${Math.floor(100 + Math.random() * 900)}`)}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-semibold rounded border border-slate-700 transition-colors whitespace-nowrap shadow-xs"
            >
              + Quick Bar Tab
            </button>
          </div>
        </div>

        {/* Category Filters */}
        <div className="p-3 bg-slate-900/30 border-b border-slate-800/80 flex items-center gap-2 overflow-x-auto scrollbar-none shrink-0">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap ${
                selectedCategory === cat.id
                  ? 'bg-slate-200 text-slate-950 font-bold shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Catalog Items Grid */}
        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 content-start">
          {filteredProducts.map(prod => {
            const isPackage = prod.productType === 'PACKAGE';
            const isRecipe = prod.productType === 'RECIPE';
            return (
              <button
                key={prod.id}
                onClick={() => handleProductClick(prod)}
                className={`p-3.5 rounded-lg border text-left flex flex-col justify-between transition-all hover:scale-[1.01] active:scale-[0.99] group ${
                  isPackage
                    ? 'bg-gradient-to-b from-amber-950/30 to-slate-900 border-amber-600/40 hover:border-amber-400'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-600 hover:bg-slate-850'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[10px] font-mono tracking-wider text-slate-400 uppercase">
                      {prod.category}
                    </span>
                    {prod.portionUnitSymbol && (
                      <span className="text-[10px] font-mono text-amber-400 font-semibold">
                        {prod.portionVolume} {prod.portionUnitSymbol}
                      </span>
                    )}
                    {isPackage && (
                      <span className="text-[10px] font-mono text-amber-300 bg-amber-500/20 px-1 rounded">
                        VIP PACKAGE
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-semibold text-slate-100 group-hover:text-white line-clamp-2">
                    {prod.name}
                  </h4>
                  {isRecipe && (
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                      Recipe with custom ingredients
                    </p>
                  )}
                </div>

                <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-xs font-mono text-slate-400">KES</span>
                  <span className="text-base font-bold font-mono tabular-nums text-amber-300">
                    {prod.price.toLocaleString()}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* RIGHT: Active Tab / Order Ledger Sidebar */}
      <div className="w-full lg:w-[420px] bg-slate-900 flex flex-col h-full shrink-0 border-l border-slate-800">
        {/* Order Header */}
        <div className="p-3.5 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white font-mono">
                {activeOrder ? activeOrder.orderNumber : 'No Active Order'}
              </span>
              {activeOrder && (
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
                  activeOrder.state === 'SENT' ? 'bg-amber-500/20 text-amber-300' :
                  activeOrder.state === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-300' :
                  'bg-slate-700 text-slate-300'
                }`}>
                  {activeOrder.state}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">
              {activeOrder?.tableName || activeOrder?.tabName || 'Select table to start'} · Waiter: {activeOrder?.serverName || currentUser.name}
            </p>
          </div>

          {activeOrder && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  if (confirm('Void this active order? Manager authorization will be logged.')) {
                    voidOrder(activeOrder.id, 'Customer changed mind');
                  }
                }}
                title="Void Order"
                className="p-1.5 text-slate-400 hover:text-rose-400 rounded hover:bg-slate-800"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Order Items List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {!activeOrder || activeOrder.items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <Sparkles className="w-8 h-8 text-slate-600 mb-2" />
              <p className="text-xs font-medium">Order ticket is empty</p>
              <p className="text-[11px] text-slate-400 mt-1 max-w-[200px]">
                Click drinks, shots, or food items on the left to add them to the bill.
              </p>
            </div>
          ) : (
            activeOrder.items.map(item => (
              <div
                key={item.id}
                className={`p-2.5 rounded border ${
                  item.isComp
                    ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-200'
                    : 'bg-slate-850/80 border-slate-750'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-slate-100 truncate">
                        {item.productName}
                      </span>
                      {item.portionName && (
                        <span className="text-[10px] font-mono text-amber-400/90 font-medium">
                          ({item.portionName})
                        </span>
                      )}
                      {item.isComp && (
                        <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1 py-0.5 rounded font-mono font-bold">
                          COMP
                        </span>
                      )}
                    </div>

                    {/* Modifiers / Mixers */}
                    {item.modifiers.length > 0 && (
                      <div className="mt-1 space-y-0.5">
                        {item.modifiers.map(m => (
                          <div key={m.modifierId} className="text-[11px] text-amber-300/80 flex items-center justify-between">
                            <span>+ {m.name}</span>
                            <span className="font-mono">KES {m.priceDelta}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {item.selectedMixers && item.selectedMixers.length > 0 && (
                      <div className="mt-1 text-[11px] text-slate-400">
                        Mixers: {item.selectedMixers.join(', ')}
                      </div>
                    )}
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-xs font-mono font-bold tabular-nums text-slate-200">
                      {item.isComp ? (
                        <span className="line-through text-slate-400 mr-1.5 font-normal">
                          KES {item.totalPrice.toLocaleString()}
                        </span>
                      ) : null}
                      KES {item.isComp ? '0' : item.totalPrice.toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Actions row: Comp button & delete */}
                <div className="mt-2 pt-1.5 border-t border-slate-750 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="font-mono text-[10px] text-slate-400">
                    Qty: {item.quantity} · Tax: KES {item.taxAmount}
                  </span>

                  <div className="flex items-center gap-2">
                    {!item.isComp && (
                      <button
                        onClick={() => {
                          setCompTargetItemId(item.id);
                          setIsCompModalOpen(true);
                        }}
                        className="hover:text-amber-400 font-medium text-[10px]"
                      >
                        Comp Item
                      </button>
                    )}
                    <button
                      onClick={() => removeItemFromOrder(item.id)}
                      className="text-slate-400 hover:text-rose-400 p-0.5"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Order Financial Calculations (Kenya 16% VAT + 2% Catering Levy + Min Spend) */}
        {activeOrder && (
          <div className="p-3.5 bg-slate-950 border-t border-slate-800 space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-400 font-mono">
              <span>Subtotal (Ex-Tax)</span>
              <span className="tabular-nums">KES {activeOrder.subtotal.toLocaleString()}</span>
            </div>

            <div className="flex justify-between text-slate-400 font-mono text-[11px]">
              <span>Output VAT (16%)</span>
              <span className="tabular-nums">KES {activeOrder.taxTotal.toLocaleString()}</span>
            </div>

            <div className="flex justify-between text-slate-400 font-mono text-[11px]">
              <span>Catering Levy (2%)</span>
              <span className="tabular-nums">KES {activeOrder.cateringLevyTotal.toLocaleString()}</span>
            </div>

            {activeOrder.shortfallAdjustment > 0 && (
              <div className="flex justify-between text-amber-400 font-mono bg-amber-950/20 px-2 py-1 rounded border border-amber-900/40">
                <span>VIP Table Shortfall (Min Spend)</span>
                <span className="tabular-nums">+KES {activeOrder.shortfallAdjustment.toLocaleString()}</span>
              </div>
            )}

            {activeOrder.discountTotal > 0 && (
              <div className="flex justify-between text-emerald-400 font-mono">
                <span>Discount Applied</span>
                <span className="tabular-nums">-KES {activeOrder.discountTotal.toLocaleString()}</span>
              </div>
            )}

            <div className="pt-2 border-t border-slate-800 flex justify-between items-baseline">
              <span className="text-sm font-bold text-white uppercase tracking-wide">
                Grand Total
              </span>
              <span className="text-xl font-bold font-mono tabular-nums text-amber-400">
                KES {activeOrder.grandTotal.toLocaleString()}
              </span>
            </div>

            {/* Quick action buttons: Send to KDS, Apply Discount, Settle */}
            <div className="pt-2 grid grid-cols-3 gap-2">
              <button
                onClick={sendOrderToKitchenAndBar}
                disabled={activeOrder.items.length === 0}
                className="py-2 px-2 bg-slate-800 hover:bg-slate-750 disabled:opacity-50 text-slate-200 text-xs font-semibold rounded border border-slate-700 flex items-center justify-center gap-1"
              >
                <Send className="w-3.5 h-3.5 text-amber-400" />
                <span>Send KDS</span>
              </button>

              <button
                onClick={() => {
                  const pct = prompt('Enter discount percentage (e.g. 10 for 10%):', '10');
                  if (pct) {
                    const num = parseFloat(pct);
                    if (!isNaN(num) && num > 0) {
                      applyOrderDiscount(num, 'Manager Courtesy Discount');
                    }
                  }
                }}
                disabled={activeOrder.items.length === 0}
                className="py-2 px-2 bg-slate-800 hover:bg-slate-750 disabled:opacity-50 text-slate-200 text-xs font-semibold rounded border border-slate-700 flex items-center justify-center gap-1"
              >
                <Percent className="w-3.5 h-3.5 text-slate-400" />
                <span>Discount</span>
              </button>

              <button
                onClick={() => {
                  setIsCheckoutOpen(true);
                  setPaymentResult(null);
                  setCashTendered(activeOrder.grandTotal);
                }}
                disabled={activeOrder.items.length === 0}
                className="py-2 px-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 text-xs font-bold rounded flex items-center justify-center gap-1 shadow-sm"
              >
                <Coins className="w-3.5 h-3.5" />
                <span>Pay & Settle</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MODAL: Portion Selector (Shot vs Double vs Bottle for Spirits) */}
      {activePortionProduct && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white">Select Serving Measure</h3>
                <p className="text-xs text-slate-400">Jameson Irish Whiskey</p>
              </div>
              <button
                onClick={() => setActivePortionProduct(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-2.5 py-4">
              <button
                onClick={() => {
                  addItemToOrder('prod-jam-shot', 30);
                  setActivePortionProduct(null);
                }}
                className="p-3 bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-lg flex items-center justify-between text-left group"
              >
                <div>
                  <div className="font-semibold text-sm text-slate-100">30 ml Single Shot</div>
                  <div className="text-xs text-slate-400 font-mono">Consumes 30 ml stock base</div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-bold text-amber-300">KES 450</div>
                </div>
              </button>

              <button
                onClick={() => {
                  addItemToOrder('prod-jam-double', 60);
                  setActivePortionProduct(null);
                }}
                className="p-3 bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-lg flex items-center justify-between text-left group"
              >
                <div>
                  <div className="font-semibold text-sm text-slate-100">60 ml Double Measure</div>
                  <div className="text-xs text-slate-400 font-mono">Consumes 60 ml stock base</div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-bold text-amber-300">KES 850</div>
                </div>
              </button>

              <button
                onClick={() => {
                  addItemToOrder('prod-jam-bottle', 750);
                  setActivePortionProduct(null);
                }}
                className="p-3 bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-lg flex items-center justify-between text-left group"
              >
                <div>
                  <div className="font-semibold text-sm text-slate-100">750 ml Full Sealed Bottle</div>
                  <div className="text-xs text-slate-400 font-mono">Consumes 1 bottle (750 ml)</div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-bold text-amber-300">KES 9,500</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Recipe Modifiers & Package Mixers */}
      {activeModifierProduct && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 max-w-lg w-full shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white">{activeModifierProduct.name}</h3>
                <p className="text-xs text-slate-400">Configure Recipe Modifiers & Inventory Adjustments</p>
              </div>
              <button
                onClick={() => setActiveModifierProduct(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modifiers List */}
            {activeModifierProduct.modifiers && (
              <div className="py-4 space-y-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
                  Modifiers / Adjustments:
                </span>
                {activeModifierProduct.modifiers.map(mod => {
                  const isChecked = selectedModifiers.includes(mod.id);
                  return (
                    <label
                      key={mod.id}
                      className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                        isChecked
                          ? 'bg-amber-500/10 border-amber-500/40 text-amber-200'
                          : 'bg-slate-850 border-slate-800 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={e => {
                            if (e.target.checked) {
                              setSelectedModifiers(prev => [...prev, mod.id]);
                            } else {
                              setSelectedModifiers(prev => prev.filter(id => id !== mod.id));
                            }
                          }}
                          className="w-4 h-4 accent-amber-500 rounded"
                        />
                        <div>
                          <div className="text-xs font-semibold">{mod.name}</div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            {mod.ingredientAdjustments.map(a => `${a.quantityDelta > 0 ? '+' : ''}${a.quantityDelta} base stock`).join(', ')}
                          </div>
                        </div>
                      </div>
                      <span className="text-xs font-mono font-bold">
                        {mod.priceDelta > 0 ? `+KES ${mod.priceDelta}` : 'KES 0'}
                      </span>
                    </label>
                  );
                })}
              </div>
            )}

            {/* Package Mixers Selection */}
            {activeModifierProduct.productType === 'PACKAGE' && (
              <div className="py-2 space-y-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
                  Selected Mixers (Included in Package):
                </span>
                <div className="text-xs text-amber-300 font-mono bg-slate-850 p-2.5 rounded border border-slate-800">
                  4x Schweppes Tonic Water / Soda Cans (Allocated from Bar Store)
                </div>
              </div>
            )}

            <div className="mt-4 pt-3 border-t border-slate-800 flex justify-end gap-2">
              <button
                onClick={() => setActiveModifierProduct(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmModifiers}
                className="px-5 py-2 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded shadow-xs"
              >
                Add to Ticket
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Comp Item */}
      {isCompModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 max-w-sm w-full shadow-2xl">
            <h3 className="text-sm font-bold text-white mb-2">Mark Item as Complimentary</h3>
            <p className="text-xs text-slate-400 mb-3">
              Item will be charged at KES 0 to the guest, but stock depletion and promo expense will be posted.
            </p>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Comp Reason</label>
                <input
                  type="text"
                  value={compReason}
                  onChange={e => setCompReason(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-xs text-white"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setIsCompModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-400"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    applyCompToItem(compTargetItemId, compReason);
                    setIsCompModalOpen(false);
                  }}
                  className="px-4 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded"
                >
                  Approve Comp
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Payment / Checkout with M-PESA Daraja & Room Charge */}
      {isCheckoutOpen && activeOrder && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>Checkout & Settle</span>
                  <span className="font-mono text-amber-400 text-sm">
                    KES {activeOrder.grandTotal.toLocaleString()}
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  Order #{activeOrder.orderNumber} · {activeOrder.tableName || activeOrder.tabName}
                </p>
              </div>
              <button
                onClick={() => {
                  setIsCheckoutOpen(false);
                  setPaymentResult(null);
                }}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {paymentResult ? (
              /* Success / Result Screen */
              <div className="py-6 text-center space-y-4">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto ${
                  paymentResult.success ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                }`}>
                  {paymentResult.success ? <CheckCircle2 className="w-8 h-8" /> : <AlertCircle className="w-8 h-8" />}
                </div>

                <div>
                  <h4 className="text-base font-bold text-white">
                    {paymentResult.success ? 'Transaction Complete & Posted' : 'Payment Failed'}
                  </h4>
                  <p className="text-xs text-slate-300 mt-1 max-w-sm mx-auto">
                    {paymentResult.message}
                  </p>
                </div>

                {paymentResult.success && (
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-left font-mono text-xs space-y-1 text-slate-300">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Tender Reference:</span>
                      <span className="text-amber-300 font-bold">{paymentResult.receipt}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">eTIMS CU Serial:</span>
                      <span>KRA-OSCU-NBO-00914</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Double-Entry Status:</span>
                      <span className="text-emerald-400">BALANCED & POSTED</span>
                    </div>
                  </div>
                )}

                <div className="pt-3 flex justify-center gap-3">
                  <button
                    onClick={() => {
                      setIsCheckoutOpen(false);
                      setPaymentResult(null);
                    }}
                    className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded"
                  >
                    Done / Next Order
                  </button>
                </div>
              </div>
            ) : (
              /* Payment Options */
              <div className="py-4 space-y-4">
                {/* Tender Tabs */}
                <div className="grid grid-cols-4 gap-1.5 p-1 bg-slate-950 rounded-lg border border-slate-800">
                  <button
                    onClick={() => setTenderType('MPESA')}
                    className={`py-2 px-1 text-xs font-semibold rounded flex flex-col items-center gap-1 transition-colors ${
                      tenderType === 'MPESA'
                        ? 'bg-emerald-600 text-white font-bold shadow-xs'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>M-PESA</span>
                  </button>

                  <button
                    onClick={() => setTenderType('CASH')}
                    className={`py-2 px-1 text-xs font-semibold rounded flex flex-col items-center gap-1 transition-colors ${
                      tenderType === 'CASH'
                        ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Coins className="w-4 h-4" />
                    <span>Cash</span>
                  </button>

                  <button
                    onClick={() => setTenderType('ROOM_CHARGE')}
                    className={`py-2 px-1 text-xs font-semibold rounded flex flex-col items-center gap-1 transition-colors ${
                      tenderType === 'ROOM_CHARGE'
                        ? 'bg-indigo-600 text-white font-bold shadow-xs'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Bed className="w-4 h-4" />
                    <span>Room Charge</span>
                  </button>

                  <button
                    onClick={() => setTenderType('CARD')}
                    className={`py-2 px-1 text-xs font-semibold rounded flex flex-col items-center gap-1 transition-colors ${
                      tenderType === 'CARD'
                        ? 'bg-blue-600 text-white font-bold shadow-xs'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Card</span>
                  </button>
                </div>

                {/* Tab Specific Content */}
                {tenderType === 'MPESA' && (
                  <div className="p-4 bg-slate-950/60 rounded-lg border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-400 font-mono flex items-center gap-1.5">
                        <Smartphone className="w-4 h-4" />
                        Safaricom Daraja API v2 (STK Push)
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        Till: 894102 | Shortcode: 174379
                      </span>
                    </div>

                    <div>
                      <label className="text-xs text-slate-300 block mb-1">Customer Phone Number</label>
                      <input
                        type="text"
                        value={mpesaPhone}
                        onChange={e => setMpesaPhone(e.target.value)}
                        placeholder="07XX XXX XXX or 2547XXXXXXXX"
                        className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm font-mono text-emerald-300 focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    {darajaStep && (
                      <div className="p-2.5 rounded bg-emerald-950/30 border border-emerald-800/40 text-xs font-mono text-emerald-300 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                        <span>{darajaStep}</span>
                      </div>
                    )}
                  </div>
                )}

                {tenderType === 'CASH' && (
                  <div className="p-4 bg-slate-950/60 rounded-lg border border-slate-800 space-y-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-300">Amount Due:</span>
                      <span className="font-mono font-bold text-amber-300">
                        KES {activeOrder.grandTotal.toLocaleString()}
                      </span>
                    </div>

                    <div>
                      <label className="text-xs text-slate-300 block mb-1">Cash Tendered</label>
                      <input
                        type="number"
                        value={cashTendered || ''}
                        onChange={e => setCashTendered(parseFloat(e.target.value) || 0)}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm font-mono text-amber-300 focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div className="flex gap-2">
                      {[1000, 2000, 5000, 10000].map(amt => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => setCashTendered(amt)}
                          className="flex-1 py-1 text-xs bg-slate-800 hover:bg-slate-700 rounded border border-slate-700 font-mono"
                        >
                          KES {amt}
                        </button>
                      ))}
                    </div>

                    <div className="p-2.5 bg-slate-900 rounded border border-slate-800 flex justify-between items-center text-xs font-mono">
                      <span className="text-slate-400">Change Due to Customer:</span>
                      <span className="text-base font-bold text-emerald-400">
                        KES {Math.max(0, (cashTendered || 0) - activeOrder.grandTotal).toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}

                {tenderType === 'ROOM_CHARGE' && (
                  <div className="p-4 bg-slate-950/60 rounded-lg border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-indigo-400 font-bold font-mono">Hotel PMS Guest Folio Lookup</span>
                      <span className="text-[10px] text-slate-400 font-mono">Subledger Transfer</span>
                    </div>

                    <div>
                      <label className="text-xs text-slate-300 block mb-1">Select Checked-in Guest Room</label>
                      <select
                        value={selectedGuestStayId}
                        onChange={e => setSelectedGuestStayId(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                      >
                        <option value="">-- Choose Guest Room --</option>
                        {guestStays
                          .filter(s => s.status === 'CHECKED_IN')
                          .map(stay => {
                            const fol = guestFolios.find(f => f.stayId === stay.id);
                            return (
                              <option key={stay.id} value={stay.id}>
                                Room {stay.roomNumber} - {stay.guestName} (Limit: KES {stay.creditLimit.toLocaleString()} | Bal: KES {fol?.balanceDue.toLocaleString()})
                              </option>
                            );
                          })}
                      </select>
                    </div>

                    <div className="text-[11px] text-slate-400 bg-slate-900/80 p-2 rounded border border-slate-800">
                      Charge will be posted to the guest's folio subledger with POS order reference #{activeOrder.orderNumber} for night audit reconciliation.
                    </div>
                  </div>
                )}

                {tenderType === 'CARD' && (
                  <div className="p-4 bg-slate-950/60 rounded-lg border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-blue-400 font-bold font-mono">Bank Terminal Clearing</span>
                      <span className="text-[10px] text-slate-400 font-mono">Visa / Mastercard / Amex</span>
                    </div>

                    <div>
                      <label className="text-xs text-slate-300 block mb-1">Terminal Auth Approval Code</label>
                      <input
                        type="text"
                        value={cardAuthCode}
                        onChange={e => setCardAuthCode(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm font-mono text-blue-300 focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                {/* Execute Button */}
                <div className="pt-2">
                  <button
                    onClick={handleExecutePayment}
                    disabled={isProcessing || (tenderType === 'ROOM_CHARGE' && !selectedGuestStayId)}
                    className="w-full py-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 text-sm font-bold rounded-lg shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    {isProcessing ? (
                      <>
                        <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                        <span>Processing & Fiscalizing...</span>
                      </>
                    ) : (
                      <>
                        <span>Confirm Payment (KES {activeOrder.grandTotal.toLocaleString()})</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
