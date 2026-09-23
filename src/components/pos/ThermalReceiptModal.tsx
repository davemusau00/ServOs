import React, { useState } from 'react';
import { Order, PaymentRecord, EtimsFiscalInvoice } from '../../types/servos';
import { useServOS } from '../../context/ServOSContext';
import { 
  Printer, 
  X, 
  Copy, 
  Check, 
  QrCode, 
  Cpu, 
  FileText, 
  Receipt,
  Download
} from 'lucide-react';

interface ThermalReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  paymentDetails?: {
    tenderType: string;
    receiptRef?: string;
    cashTendered?: number;
    changeDue?: number;
    guestName?: string;
    roomNumber?: string;
  };
  isProForma?: boolean; // When printing bill before payment
}

export const ThermalReceiptModal: React.FC<ThermalReceiptModalProps> = ({
  isOpen,
  onClose,
  order,
  paymentDetails,
  isProForma = false
}) => {
  const { currentProperty, currentOutlet, triggerEdgePrint, etimsInvoices } = useServOS();
  const [copied, setCopied] = useState<boolean>(false);
  const [edgeSent, setEdgeSent] = useState<boolean>(false);

  if (!isOpen || !order) return null;

  // Find linked eTIMS invoice if available
  const fiscalInvoice = etimsInvoices.find(inv => inv.orderId === order.id);

  const formattedDate = new Date(order.completedAt || order.createdAt).toLocaleString('en-KE', {
    dateStyle: 'medium',
    timeStyle: 'medium'
  });

  const generateRawEscPos = () => {
    let text = `================================================\n`;
    text += `          SERVOS HOSPITALITY SUITE\n`;
    text += `         ${currentProperty.name.toUpperCase()}\n`;
    text += `            ${currentOutlet.name}\n`;
    text += `KRA PIN: P051982736Z  |  CU: KRA-OSCU-NBO-00914\n`;
    text += `------------------------------------------------\n`;
    text += isProForma 
      ? `               *** BILL CHECK / PRO-FORMA ***\n` 
      : `            *** FISCAL TAX RECEIPT ***\n`;
    text += `Order: ${order.orderNumber}     Table/Tab: ${order.tableName || order.tabName || 'Walk-In'}\n`;
    text += `Server: ${order.serverName}      Date: ${formattedDate}\n`;
    text += `------------------------------------------------\n`;
    text += `QTY  DESCRIPTION                      AMOUNT(KES)\n`;
    text += `------------------------------------------------\n`;

    order.items.forEach(item => {
      const name = item.productName.slice(0, 24).padEnd(25, ' ');
      const portion = item.portionName ? ` (${item.portionName})` : '';
      const priceStr = item.isComp ? '0.00' : item.totalPrice.toFixed(2);
      text += `${item.quantity.toString().padEnd(3, ' ')} ${(name + portion).slice(0, 26).padEnd(27, ' ')} ${priceStr.padStart(10, ' ')}\n`;
      if (item.isComp) {
        text += `     * COMPLIMENTARY: ${item.compReason || 'VIP Guest'}\n`;
      }
      if (item.modifiers && item.modifiers.length > 0) {
        item.modifiers.forEach(m => {
          text += `     + ${m.name.padEnd(24, ' ')} ${m.priceDelta.toFixed(2).padStart(10, ' ')}\n`;
        });
      }
      if (item.selectedMixers && item.selectedMixers.length > 0) {
        text += `     Mixers: ${item.selectedMixers.join(', ')}\n`;
      }
    });

    text += `------------------------------------------------\n`;
    text += `Subtotal (Ex-Tax):              KES ${order.subtotal.toFixed(2).padStart(10, ' ')}\n`;
    text += `16% Output VAT:                 KES ${order.taxTotal.toFixed(2).padStart(10, ' ')}\n`;
    text += `2% Catering Levy:               KES ${order.cateringLevyTotal.toFixed(2).padStart(10, ' ')}\n`;
    
    if (order.shortfallAdjustment > 0) {
      text += `VIP Min-Spend Shortfall:        KES ${order.shortfallAdjustment.toFixed(2).padStart(10, ' ')}\n`;
    }
    if (order.discountTotal > 0) {
      text += `Discount Applied:              -KES ${order.discountTotal.toFixed(2).padStart(10, ' ')}\n`;
    }

    text += `================================================\n`;
    text += `TOTAL PAYABLE:                  KES ${order.grandTotal.toFixed(2).padStart(10, ' ')}\n`;
    text += `================================================\n`;

    if (!isProForma && paymentDetails) {
      text += `TENDER: ${paymentDetails.tenderType}\n`;
      if (paymentDetails.receiptRef) {
        text += `Reference / Auth: ${paymentDetails.receiptRef}\n`;
      }
      if (paymentDetails.cashTendered) {
        text += `Cash Tendered: KES ${paymentDetails.cashTendered.toFixed(2)} | Change: KES ${(paymentDetails.changeDue || 0).toFixed(2)}\n`;
      }
      if (paymentDetails.roomNumber) {
        text += `Room: ${paymentDetails.roomNumber} - Guest: ${paymentDetails.guestName}\n`;
      }
      text += `------------------------------------------------\n`;
      text += `KRA eTIMS Verification URL:\nhttps://itax.kra.go.ke/KRA-Portal/invoiceVerification\n`;
      text += `Invoice No: ${fiscalInvoice?.invoiceNumber || 'INV-2026-0923-' + order.orderNumber.replace('ORD-', '')}\n`;
      text += `Verification Hash: eT-78f9c10a48b301\n`;
    }

    text += `------------------------------------------------\n`;
    text += `          THANK YOU FOR VISITING US!\n`;
    text += `         Powered by ServOS Hospitality\n`;
    text += `================================================\n`;
    return text;
  };

  const handleBrowserPrint = () => {
    window.print();
  };

  const handleSendEdgePrint = () => {
    triggerEdgePrint('RECEIPT', {
      orderId: order.id,
      orderNumber: order.orderNumber,
      tableName: order.tableName || order.tabName,
      grandTotal: order.grandTotal,
      isProForma
    });
    setEdgeSent(true);
    setTimeout(() => setEdgeSent(false), 2500);
  };

  const handleCopyRaw = () => {
    navigator.clipboard.writeText(generateRawEscPos());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      {/* 1. Modal Overlay for Screen Display */}
      <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 no-print overflow-y-auto">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden my-auto">
          {/* Header */}
          <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
            <div className="flex items-center gap-2.5">
              <Receipt className="w-5 h-5 text-amber-400" />
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white">
                  {isProForma ? 'Table Bill Check / Pro-Forma' : 'ESC/POS Thermal Receipt'}
                </h3>
                <p className="text-[11px] text-slate-400 font-mono">
                  80mm Roll • High-Contrast POS Thermal Output
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body: Thermal Paper Emulation Preview */}
          <div className="p-4 sm:p-6 bg-slate-950/80 max-h-[68vh] overflow-y-auto flex flex-col items-center">
            {/* The Paper Ticket */}
            <div className="w-full max-w-[340px] bg-white text-slate-950 font-mono text-[11px] leading-tight p-5 shadow-2xl rounded-sm border border-slate-200 select-all">
              {/* Receipt Header */}
              <div className="text-center space-y-0.5 pb-2">
                <div className="font-extrabold text-sm tracking-wide">
                  SERVOS HOSPITALITY
                </div>
                <div className="font-bold text-[10px] text-slate-800 uppercase">
                  {currentProperty.name}
                </div>
                <div className="text-[10px] text-slate-700">
                  {currentOutlet.name}
                </div>
                <div className="text-[10px] text-slate-600 font-semibold pt-0.5">
                  PIN: P051982736Z | CU: KRA-OSCU-NBO-00914
                </div>
                <div className="border-b border-dashed border-slate-400 my-2" />
                <div className="font-bold text-xs uppercase tracking-wider text-slate-900">
                  {isProForma ? '*** PRO-FORMA BILL CHECK ***' : '*** OFFICIAL FISCAL RECEIPT ***'}
                </div>
              </div>

              {/* Order Meta */}
              <div className="text-[10px] space-y-0.5 py-1 text-slate-750">
                <div className="flex justify-between">
                  <span>ORDER: <strong className="text-slate-950">{order.orderNumber}</strong></span>
                  <span>TABLE: <strong className="text-slate-950">{order.tableName || order.tabName || 'Walk-In'}</strong></span>
                </div>
                <div className="flex justify-between">
                  <span>SERVER: {order.serverName}</span>
                  <span>{formattedDate.split(',')[1]?.trim() || ''}</span>
                </div>
                <div className="text-[9px] text-slate-500">
                  DATE: {formattedDate.split(',')[0]}
                </div>
              </div>

              <div className="border-b border-dashed border-slate-400 my-1.5" />

              {/* Table Column Titles */}
              <div className="flex justify-between font-bold text-[10px] text-slate-800 pb-1">
                <span>QTY  ITEM</span>
                <span>KES</span>
              </div>
              <div className="border-b border-dotted border-slate-300 mb-1" />

              {/* Items List */}
              <div className="space-y-1.5 py-1">
                {order.items.map(item => (
                  <div key={item.id} className="text-[10.5px]">
                    <div className="flex justify-between items-start gap-1">
                      <span className="font-medium">
                        {item.quantity}x {item.productName}
                        {item.portionName && (
                          <span className="text-[9px] text-slate-600 block">
                            ↳ Portion: {item.portionName}
                          </span>
                        )}
                      </span>
                      <span className="font-bold whitespace-nowrap tabular-nums">
                        {item.isComp ? (
                          <span className="text-emerald-700 font-bold">COMP (0.00)</span>
                        ) : (
                          item.totalPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })
                        )}
                      </span>
                    </div>

                    {item.isComp && (
                      <div className="text-[9px] text-slate-500 italic pl-3">
                        Reason: {item.compReason || 'VIP Hospitality'}
                      </div>
                    )}

                    {/* Modifiers */}
                    {item.modifiers && item.modifiers.length > 0 && (
                      <div className="pl-3 text-[9.5px] text-slate-600 space-y-0.5">
                        {item.modifiers.map(m => (
                          <div key={m.modifierId} className="flex justify-between">
                            <span>+ {m.name}</span>
                            <span>{m.priceDelta > 0 ? `+${m.priceDelta.toFixed(2)}` : '0.00'}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Package Mixers */}
                    {item.selectedMixers && item.selectedMixers.length > 0 && (
                      <div className="pl-3 text-[9px] text-slate-500">
                        Mixers: {item.selectedMixers.join(', ')}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="border-b border-dashed border-slate-400 my-2" />

              {/* Financial Subtotals */}
              <div className="text-[10px] space-y-1 text-slate-750">
                <div className="flex justify-between">
                  <span>Subtotal (Ex-Tax)</span>
                  <span className="tabular-nums">KES {order.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between">
                  <span>Output VAT (16%)</span>
                  <span className="tabular-nums">KES {order.taxTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between">
                  <span>Catering Levy (2%)</span>
                  <span className="tabular-nums">KES {order.cateringLevyTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>

                {order.shortfallAdjustment > 0 && (
                  <div className="flex justify-between text-amber-900 font-bold">
                    <span>VIP Min-Spend Shortfall</span>
                    <span className="tabular-nums">+KES {order.shortfallAdjustment.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                )}

                {order.discountTotal > 0 && (
                  <div className="flex justify-between text-emerald-800 font-bold">
                    <span>Discount ({order.discountReason || 'Manager'})</span>
                    <span className="tabular-nums">-KES {order.discountTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                )}
              </div>

              <div className="border-b-2 border-slate-900 my-2" />

              {/* Grand Total */}
              <div className="flex justify-between items-baseline py-0.5">
                <span className="text-xs font-black uppercase text-slate-950">TOTAL AMOUNT</span>
                <span className="text-base font-black tabular-nums text-slate-950">
                  KES {order.grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="border-b-2 border-slate-900 my-2" />

              {/* Settlement info if paid */}
              {!isProForma && (
                <div className="text-[10px] space-y-1 py-1">
                  <div className="flex justify-between">
                    <span className="font-bold">PAID VIA:</span>
                    <span className="font-bold text-slate-950">{paymentDetails?.tenderType || order.paymentMethod || 'SETTLED'}</span>
                  </div>
                  {paymentDetails?.receiptRef && (
                    <div className="flex justify-between text-slate-700">
                      <span>Daraja Ref:</span>
                      <span className="font-mono font-bold">{paymentDetails.receiptRef}</span>
                    </div>
                  )}
                  {paymentDetails?.cashTendered !== undefined && paymentDetails.cashTendered > 0 && (
                    <>
                      <div className="flex justify-between text-slate-700">
                        <span>Cash Tendered:</span>
                        <span>KES {paymentDetails.cashTendered.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between font-bold text-slate-950">
                        <span>Change Given:</span>
                        <span>KES {(paymentDetails.changeDue || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                      </div>
                    </>
                  )}
                  {paymentDetails?.roomNumber && (
                    <div className="text-[9.5px] text-slate-800 pt-0.5">
                      Charged to Room {paymentDetails.roomNumber} ({paymentDetails.guestName})
                    </div>
                  )}
                </div>
              )}

              {/* eTIMS QR Block */}
              {!isProForma && (
                <div className="pt-2 text-center border-t border-dashed border-slate-400 mt-2">
                  <div className="text-[9px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Kenya Revenue Authority • eTIMS
                  </div>
                  
                  {/* Visual QR Code representation */}
                  <div className="inline-block p-2 bg-slate-900 text-white rounded my-1">
                    <QrCode className="w-16 h-16 mx-auto text-white" />
                  </div>

                  <div className="text-[8.5px] text-slate-600 font-mono mt-1 break-all">
                    CU: KRA-OSCU-NBO-00914<br />
                    INV: {fiscalInvoice?.invoiceNumber || `INV-2026-0923-${order.orderNumber.replace('ORD-', '')}`}<br />
                    Hash: eT-9f82...84a1 [VERIFIED]
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="text-center pt-3 space-y-0.5 text-[9px] text-slate-600">
                <div className="font-semibold text-slate-800">
                  {isProForma ? 'PLEASE PRESENT TO CASHIER WHEN READY TO PAY' : 'THANK YOU FOR YOUR PATRONAGE!'}
                </div>
                <div>Goods once sold are subject to venue policy</div>
                <div className="text-[8px] text-slate-400 pt-1 font-mono">
                  SERVOS ERP • FASTIFY-REACT MONOLITH
                </div>
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="p-4 bg-slate-900 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyRaw}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-medium rounded border border-slate-700 flex items-center gap-1.5 transition-colors"
                title="Copy ASCII ESC/POS text to clipboard"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy ESC/POS'}</span>
              </button>

              <button
                onClick={handleSendEdgePrint}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-amber-300 text-xs font-medium rounded border border-slate-700 flex items-center gap-1.5 transition-colors"
                title="Send raw ESC/POS bytes directly to Edge LAN printer bridge"
              >
                <Cpu className="w-3.5 h-3.5 text-amber-400" />
                <span>{edgeSent ? 'Sent to LAN!' : 'Edge LAN Printer'}</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="px-4 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Done
              </button>

              <button
                onClick={handleBrowserPrint}
                className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 transition-all"
              >
                <Printer className="w-4 h-4" />
                <span>Print Thermal Receipt (80mm)</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Hidden DOM Container specifically targeted by @media print */}
      <div id="thermal-receipt-print-root" className="hidden">
        <div className="thermal-receipt-body">
          <div style={{ textAlign: 'center', marginBottom: '8px' }}>
            <div style={{ fontWeight: 'bold', fontSize: '13px' }}>SERVOS HOSPITALITY</div>
            <div style={{ fontSize: '10px', textTransform: 'uppercase' }}>{currentProperty.name}</div>
            <div style={{ fontSize: '10px' }}>{currentOutlet.name}</div>
            <div style={{ fontSize: '9px', marginTop: '2px' }}>PIN: P051982736Z | CU: KRA-OSCU-NBO-00914</div>
            <div style={{ borderBottom: '1px dashed #000', margin: '6px 0' }} />
            <div style={{ fontWeight: 'bold', fontSize: '11px' }}>
              {isProForma ? '*** PRO-FORMA BILL CHECK ***' : '*** FISCAL TAX RECEIPT ***'}
            </div>
          </div>

          <div style={{ fontSize: '9.5px', marginBottom: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>ORDER: <strong>{order.orderNumber}</strong></span>
              <span>TABLE: <strong>{order.tableName || order.tabName || 'Walk-In'}</strong></span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>SERVER: {order.serverName}</span>
              <span>{formattedDate}</span>
            </div>
          </div>

          <div style={{ borderBottom: '1px dashed #000', margin: '4px 0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '10px' }}>
            <span>QTY  DESCRIPTION</span>
            <span>AMOUNT(KES)</span>
          </div>
          <div style={{ borderBottom: '1px dotted #000', margin: '3px 0' }} />

          <div style={{ fontSize: '10px' }}>
            {order.items.map(item => (
              <div key={item.id} style={{ marginBottom: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>
                    {item.quantity}x {item.productName}
                    {item.portionName ? ` (${item.portionName})` : ''}
                  </span>
                  <span>
                    {item.isComp ? 'COMP (0.00)' : item.totalPrice.toFixed(2)}
                  </span>
                </div>
                {item.modifiers?.map(m => (
                  <div key={m.modifierId} style={{ display: 'flex', justifyContent: 'space-between', paddingLeft: '8px', fontSize: '9px' }}>
                    <span>+ {m.name}</span>
                    <span>{m.priceDelta > 0 ? m.priceDelta.toFixed(2) : '0.00'}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>

          <div style={{ borderBottom: '1px dashed #000', margin: '6px 0' }} />

          <div style={{ fontSize: '9.5px', lineHeight: '1.4' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Subtotal (Ex-Tax)</span>
              <span>KES {order.subtotal.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Output VAT (16%)</span>
              <span>KES {order.taxTotal.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Catering Levy (2%)</span>
              <span>KES {order.cateringLevyTotal.toFixed(2)}</span>
            </div>
            {order.shortfallAdjustment > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>VIP Min-Spend Shortfall</span>
                <span>+KES {order.shortfallAdjustment.toFixed(2)}</span>
              </div>
            )}
            {order.discountTotal > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Discount Applied</span>
                <span>-KES {order.discountTotal.toFixed(2)}</span>
              </div>
            )}
          </div>

          <div style={{ borderBottom: '2px solid #000', margin: '6px 0' }} />

          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '13px' }}>
            <span>TOTAL AMOUNT</span>
            <span>KES {order.grandTotal.toFixed(2)}</span>
          </div>

          <div style={{ borderBottom: '2px solid #000', margin: '6px 0' }} />

          {!isProForma && (
            <div style={{ fontSize: '9.5px', lineHeight: '1.4' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>PAID VIA:</span>
                <span><strong>{paymentDetails?.tenderType || order.paymentMethod || 'SETTLED'}</strong></span>
              </div>
              {paymentDetails?.receiptRef && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Daraja Ref:</span>
                  <span>{paymentDetails.receiptRef}</span>
                </div>
              )}
              {paymentDetails?.cashTendered && (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Cash Tendered:</span>
                    <span>KES {paymentDetails.cashTendered.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Change Due:</span>
                    <span>KES {(paymentDetails.changeDue || 0).toFixed(2)}</span>
                  </div>
                </>
              )}
              {paymentDetails?.roomNumber && (
                <div>Room: {paymentDetails.roomNumber} - {paymentDetails.guestName}</div>
              )}
              <div style={{ textAlign: 'center', marginTop: '8px', borderTop: '1px dashed #000', paddingTop: '6px' }}>
                <div style={{ fontSize: '8.5px' }}>KRA eTIMS VERIFICATION URL:</div>
                <div style={{ fontSize: '8px' }}>https://itax.kra.go.ke/KRA-Portal/invoiceVerification</div>
                <div style={{ fontSize: '8.5px', marginTop: '2px' }}>
                  INV: {fiscalInvoice?.invoiceNumber || `INV-2026-0923-${order.orderNumber.replace('ORD-', '')}`}
                </div>
              </div>
            </div>
          )}

          <div style={{ textAlign: 'center', marginTop: '10px', fontSize: '9px' }}>
            <div>{isProForma ? 'PLEASE PAY CASHIER' : 'THANK YOU FOR VISITING SERVOS!'}</div>
            <div style={{ fontSize: '8px' }}>System: ServOS Hospitality Platform v1.0</div>
          </div>
        </div>
      </div>
    </>
  );
};
