/**
 * ServOS - Central State & Domain Engine
 * Implements: Double-entry posting, immutable inventory ledger,
 * M-PESA Daraja adapter, eTIMS fiscalizer, offline synchronization,
 * Hotel Folios, Control Engine rules & North Star evidence trail.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Organization,
  Property,
  Outlet,
  Terminal,
  StockItem,
  StockMovement,
  StockLocation,
  ProductSellable,
  RestaurantTable,
  Order,
  OrderItem,
  PaymentRecord,
  TillSession,
  Account,
  JournalEntry,
  JournalLine,
  EtimsFiscalInvoice,
  HotelRoom,
  GuestStay,
  GuestFolio,
  FolioEntry,
  Supplier,
  PurchaseOrder,
  Employee,
  AnomalyAlert,
  ApprovalRequest,
  EdgeDevice
} from '../types/servos';

interface ServOSContextType {
  // Tenancy
  organization: Organization;
  currentProperty: Property;
  outlets: Outlet[];
  currentOutlet: Outlet;
  setCurrentOutlet: (outlet: Outlet) => void;
  terminals: Terminal[];
  currentTerminal: Terminal;
  currentUser: Employee;
  setCurrentUser: (emp: Employee) => void;
  employees: Employee[];

  // Catalog & Inventory
  stockItems: StockItem[];
  stockLocations: StockLocation[];
  stockMovements: StockMovement[];
  products: ProductSellable[];
  transferStock: (
    stockItemId: string,
    fromLocId: string,
    toLocId: string,
    quantity: number,
    reason: string
  ) => void;
  declareWaste: (
    stockItemId: string,
    locationId: string,
    quantity: number,
    reason: string
  ) => void;
  recordStockCountAdjustment: (
    stockItemId: string,
    locationId: string,
    countedQty: number,
    notes: string
  ) => void;

  // Tables & POS
  tables: RestaurantTable[];
  activeOrder: Order | null;
  orders: Order[];
  createOrderForTable: (tableId: string) => Order;
  createQuickBarTab: (tabName?: string) => Order;
  selectOrder: (orderId: string) => void;
  addItemToOrder: (
    productId: string,
    portionVolume?: number,
    modifiers?: { modifierId: string; name: string; priceDelta: number }[],
    selectedMixers?: string[]
  ) => void;
  removeItemFromOrder: (itemId: string) => void;
  sendOrderToKitchenAndBar: () => void;
  applyCompToItem: (itemId: string, reason: string) => void;
  applyOrderDiscount: (discountPct: number, reason: string) => void;
  voidOrder: (orderId: string, reason: string) => void;
  transferOrderToTable: (orderId: string, newTableId: string) => void;

  // Payments & Cash Drawer
  processPayment: (
    orderId: string,
    tenderType: 'CASH' | 'MPESA' | 'CARD' | 'ROOM_CHARGE',
    amount: number,
    options?: {
      phoneNumber?: string;
      cashTendered?: number;
      guestStayId?: string;
      cardAuthCode?: string;
    }
  ) => Promise<{ success: boolean; message: string; receipt?: string }>;
  tillSession: TillSession | null;
  openTillSession: (floatAmount: number) => void;
  closeTillSession: (countedCash: number) => void;
  recordCashPaidInOut: (type: 'IN' | 'OUT', amount: number, reason: string) => void;

  // Accounting & eTIMS
  accounts: Account[];
  journalEntries: JournalEntry[];
  etimsInvoices: EtimsFiscalInvoice[];

  // Hotel PMS
  hotelRooms: HotelRoom[];
  guestStays: GuestStay[];
  guestFolios: GuestFolio[];
  updateRoomStatus: (roomId: string, status: HotelRoom['status']) => void;
  postMinibarConsumption: (
    roomId: string,
    itemsConsumed: { stockItemId: string; qty: number }[]
  ) => void;
  settleGuestFolio: (folioId: string, tenderType: 'CASH' | 'MPESA' | 'CARD') => void;

  // Procurement
  suppliers: Supplier[];
  purchaseOrders: PurchaseOrder[];
  receivePurchaseOrder: (poId: string, receivedNotes?: string) => void;
  createPurchaseOrder: (
    supplierId: string,
    items: { stockItemId: string; quantity: number; unitPrice: number }[]
  ) => void;

  // Control Engine & Audit
  anomalyAlerts: AnomalyAlert[];
  approvalRequests: ApprovalRequest[];
  acknowledgeAlert: (alertId: string, note?: string) => void;
  resolveAlert: (alertId: string, resolutionNote: string) => void;
  handleApproval: (requestId: string, approved: boolean, reason?: string) => void;

  // Offline Mode & Edge Agent
  isOffline: boolean;
  toggleOfflineMode: () => void;
  offlineQueueCount: number;
  syncOfflineQueue: () => void;
  edgeDevices: EdgeDevice[];
  triggerEdgePrint: (documentType: 'RECEIPT' | 'KITCHEN_TICKET', payload: any) => void;
  triggerCashDrawerKick: () => void;
  lastEdgeEvent: string | null;

  // North Star Traceability Query
  traceEvidence: (query: string) => {
    type: 'ORDER' | 'STOCK' | 'FOLIO' | 'JOURNAL' | 'NONE';
    order?: Order;
    stockItem?: StockItem;
    movements?: StockMovement[];
    folio?: GuestFolio;
    journalEntry?: JournalEntry;
    fiscalInvoice?: EtimsFiscalInvoice;
    payment?: PaymentRecord;
  };
}

const ServOSContext = createContext<ServOSContextType | null>(null);

// ================= INITIAL SEED DATA =================

const initialOrg: Organization = {
  id: 'org-simba-01',
  name: 'Simba Hospitality Group East Africa',
  code: 'SHG-EA',
  baseCurrency: 'KES'
};

const initialProperty: Property = {
  id: 'prop-nairobi-01',
  organizationId: 'org-simba-01',
  name: 'The Grand Nairobi Resort & Club',
  code: 'GNR-01',
  currency: 'KES',
  timezone: 'Africa/Nairobi',
  kraPin: 'P051284920M',
  etimsCuNumber: 'KRA-OSCU-NBO-00914'
};

const initialOutlets: Outlet[] = [
  {
    id: 'out-bar-01',
    propertyId: 'prop-nairobi-01',
    name: 'Main Bar & VIP Lounge',
    type: 'BAR',
    defaultStockLocationId: 'loc-bar-store',
    active: true
  },
  {
    id: 'out-grill-01',
    propertyId: 'prop-nairobi-01',
    name: 'Kikao Grill Room',
    type: 'RESTAURANT',
    defaultStockLocationId: 'loc-kitchen-store',
    active: true
  },
  {
    id: 'out-hotel-01',
    propertyId: 'prop-nairobi-01',
    name: 'Front Desk & Concierge',
    type: 'HOTEL_FRONT',
    defaultStockLocationId: 'loc-minibar-depot',
    active: true
  },
  {
    id: 'out-pool-01',
    propertyId: 'prop-nairobi-01',
    name: 'Pool & Garden Lounge',
    type: 'POOL_LOUNGE',
    defaultStockLocationId: 'loc-bar-store',
    active: true
  }
];

const initialStockLocations: StockLocation[] = [
  { id: 'loc-warehouse', propertyId: 'prop-nairobi-01', name: 'Central Warehouse Depot', type: 'WAREHOUSE' },
  { id: 'loc-bar-store', propertyId: 'prop-nairobi-01', name: 'Main Bar Beverage Station', type: 'BAR_STORE' },
  { id: 'loc-kitchen-store', propertyId: 'prop-nairobi-01', name: 'Kitchen Coldstore & Pass', type: 'KITCHEN_STORE' },
  { id: 'loc-minibar-depot', propertyId: 'prop-nairobi-01', name: 'Housekeeping Minibar Depot', type: 'MINIBAR' }
];

const initialStockItems: StockItem[] = [
  {
    id: 'stk-jameson',
    code: 'SPIRIT-JAM-750',
    name: 'Jameson Irish Whiskey 750ml',
    dimension: 'VOLUME',
    baseUnit: 'ml',
    parLevel: 15000,
    reorderPoint: 4500,
    currentStock: {
      'loc-warehouse': 30000,
      'loc-bar-store': 4200,
      'loc-minibar-depot': 1500
    },
    averageUnitCost: 3.73, // KES 2,800 per 750ml bottle
    category: 'Spirits - Whiskey'
  },
  {
    id: 'stk-tanqueray',
    code: 'SPIRIT-TANQ-1000',
    name: 'Tanqueray London Dry Gin 1000ml',
    dimension: 'VOLUME',
    baseUnit: 'ml',
    parLevel: 20000,
    reorderPoint: 5000,
    currentStock: {
      'loc-warehouse': 25000,
      'loc-bar-store': 6800,
      'loc-minibar-depot': 2000
    },
    averageUnitCost: 3.20, // KES 3,200 per 1000ml bottle
    category: 'Spirits - Gin'
  },
  {
    id: 'stk-dom-perignon',
    code: 'CHAMP-DOMP-750',
    name: 'Dom Pérignon Vintage Champagne 750ml',
    dimension: 'VOLUME',
    baseUnit: 'ml',
    parLevel: 7500,
    reorderPoint: 2250,
    currentStock: {
      'loc-warehouse': 9000,
      'loc-bar-store': 2250,
      'loc-minibar-depot': 750
    },
    averageUnitCost: 50.66, // KES 38,000 per 750ml bottle
    category: 'Wine & Champagne'
  },
  {
    id: 'stk-tusker',
    code: 'BEER-TUSK-500',
    name: 'Tusker Lager Bottle 500ml',
    dimension: 'COUNT',
    baseUnit: 'unit',
    parLevel: 240,
    reorderPoint: 60,
    currentStock: {
      'loc-warehouse': 480,
      'loc-bar-store': 96,
      'loc-minibar-depot': 48
    },
    averageUnitCost: 180.00,
    category: 'Beer & Cider'
  },
  {
    id: 'stk-guinness-keg',
    code: 'KEG-GUINN-50L',
    name: 'Guinness Keg 50L (50,000ml)',
    dimension: 'VOLUME',
    baseUnit: 'ml',
    parLevel: 100000,
    reorderPoint: 40000,
    currentStock: {
      'loc-warehouse': 100000,
      'loc-bar-store': 42500
    },
    averageUnitCost: 0.33, // KES 16,500 per 50L
    category: 'Draught Beer'
  },
  {
    id: 'stk-tonic',
    code: 'MIXER-TONIC-200',
    name: 'Schweppes Tonic Water Can 200ml',
    dimension: 'COUNT',
    baseUnit: 'unit',
    parLevel: 300,
    reorderPoint: 72,
    currentStock: {
      'loc-warehouse': 600,
      'loc-bar-store': 120,
      'loc-minibar-depot': 60
    },
    averageUnitCost: 80.00,
    category: 'Mixers'
  },
  {
    id: 'stk-lime',
    code: 'PRODUCE-LIME',
    name: 'Fresh Limes (Cocktail Garnish)',
    dimension: 'COUNT',
    baseUnit: 'unit',
    parLevel: 100,
    reorderPoint: 25,
    currentStock: {
      'loc-warehouse': 150,
      'loc-bar-store': 45
    },
    averageUnitCost: 15.00,
    category: 'Fresh Produce'
  },
  {
    id: 'stk-ribeye',
    code: 'MEAT-RIBEYE-KG',
    name: 'Prime Aged Beef Ribeye Steak (g)',
    dimension: 'MASS',
    baseUnit: 'g',
    parLevel: 25000,
    reorderPoint: 6000,
    currentStock: {
      'loc-warehouse': 35000,
      'loc-kitchen-store': 12000
    },
    averageUnitCost: 4.50, // KES 4,500 per kg
    category: 'Meats & Grill'
  }
];

const initialProducts: ProductSellable[] = [
  {
    id: 'prod-jam-shot',
    code: 'JAM-SHT-30',
    name: 'Jameson Shot (30ml)',
    category: 'SPIRITS',
    productType: 'PORTION',
    consumptionMethod: 'MEASURED',
    price: 450,
    taxClassId: 'A_16',
    outletIds: ['out-bar-01', 'out-grill-01', 'out-pool-01'],
    stockItemId: 'stk-jameson',
    portionVolume: 30,
    portionUnitSymbol: 'ml',
    available: true,
    routeTo: 'BAR'
  },
  {
    id: 'prod-jam-double',
    code: 'JAM-DBL-60',
    name: 'Jameson Double (60ml)',
    category: 'SPIRITS',
    productType: 'PORTION',
    consumptionMethod: 'MEASURED',
    price: 850,
    taxClassId: 'A_16',
    outletIds: ['out-bar-01', 'out-grill-01', 'out-pool-01'],
    stockItemId: 'stk-jameson',
    portionVolume: 60,
    portionUnitSymbol: 'ml',
    available: true,
    routeTo: 'BAR'
  },
  {
    id: 'prod-jam-bottle',
    code: 'JAM-BTL-750',
    name: 'Jameson Bottle 750ml',
    category: 'SPIRITS',
    productType: 'STOCK_ITEM',
    consumptionMethod: 'MEASURED',
    price: 9500,
    taxClassId: 'A_16',
    outletIds: ['out-bar-01', 'out-grill-01'],
    stockItemId: 'stk-jameson',
    portionVolume: 750,
    portionUnitSymbol: 'ml',
    available: true,
    routeTo: 'BAR'
  },
  {
    id: 'prod-tanq-gt',
    code: 'CKTL-TANQ-GT',
    name: 'Tanqueray Classic G&T',
    category: 'COCKTAIL',
    productType: 'RECIPE',
    consumptionMethod: 'RECIPE',
    price: 850,
    taxClassId: 'A_16',
    outletIds: ['out-bar-01', 'out-grill-01', 'out-pool-01'],
    recipeIngredients: [
      { stockItemId: 'stk-tanqueray', quantity: 60, unitSymbol: 'ml', tracked: true },
      { stockItemId: 'stk-tonic', quantity: 1, unitSymbol: 'can', tracked: true },
      { stockItemId: 'stk-lime', quantity: 0.5, unitSymbol: 'ea', tracked: true }
    ],
    modifiers: [
      {
        id: 'mod-extra-gin',
        name: 'Extra 30ml Gin Shot',
        priceDelta: 300,
        ingredientAdjustments: [{ stockItemId: 'stk-tanqueray', quantityDelta: 30 }]
      },
      {
        id: 'mod-no-lime',
        name: 'Hold the Lime',
        priceDelta: 0,
        ingredientAdjustments: [{ stockItemId: 'stk-lime', quantityDelta: -0.5 }]
      },
      {
        id: 'mod-extra-tonic',
        name: 'Extra Tonic Can',
        priceDelta: 120,
        ingredientAdjustments: [{ stockItemId: 'stk-tonic', quantityDelta: 1 }]
      }
    ],
    available: true,
    routeTo: 'BAR'
  },
  {
    id: 'prod-tusker-500',
    code: 'BEER-TUSK-500',
    name: 'Tusker Lager (500ml)',
    category: 'BEER',
    productType: 'STOCK_ITEM',
    consumptionMethod: 'UNIT',
    price: 400,
    taxClassId: 'A_16',
    outletIds: ['out-bar-01', 'out-grill-01', 'out-pool-01'],
    stockItemId: 'stk-tusker',
    available: true,
    routeTo: 'BAR'
  },
  {
    id: 'prod-guinness-pint',
    code: 'DRT-GUINN-500',
    name: 'Guinness Draught Pint (500ml)',
    category: 'BEER',
    productType: 'PORTION',
    consumptionMethod: 'MEASURED',
    price: 500,
    taxClassId: 'A_16',
    outletIds: ['out-bar-01', 'out-grill-01'],
    stockItemId: 'stk-guinness-keg',
    portionVolume: 500,
    portionUnitSymbol: 'ml',
    available: true,
    routeTo: 'BAR'
  },
  {
    id: 'prod-dom-vip-pkg',
    code: 'PKG-DOMP-VIP',
    name: 'Dom Pérignon VIP Bottle Service',
    category: 'PACKAGE',
    productType: 'PACKAGE',
    consumptionMethod: 'RECIPE',
    price: 58000,
    taxClassId: 'A_16',
    outletIds: ['out-bar-01'],
    recipeIngredients: [
      { stockItemId: 'stk-dom-perignon', quantity: 750, unitSymbol: 'ml', tracked: true },
      { stockItemId: 'stk-tonic', quantity: 4, unitSymbol: 'can', tracked: true }
    ],
    packageMixersCount: 4,
    available: true,
    routeTo: 'BAR'
  },
  {
    id: 'prod-ribeye-300',
    code: 'FOOD-RIBEYE-300',
    name: 'Aged Prime Ribeye Steak (300g)',
    category: 'FOOD',
    productType: 'RECIPE',
    consumptionMethod: 'MEASURED',
    price: 3400,
    taxClassId: 'A_16',
    outletIds: ['out-grill-01', 'out-bar-01'],
    recipeIngredients: [
      { stockItemId: 'stk-ribeye', quantity: 300, unitSymbol: 'g', tracked: true }
    ],
    available: true,
    routeTo: 'KITCHEN'
  }
];

const initialStockMovements: StockMovement[] = [
  {
    id: 'mvt-1001',
    organizationId: 'org-simba-01',
    propertyId: 'prop-nairobi-01',
    stockItemId: 'stk-jameson',
    stockItemName: 'Jameson Irish Whiskey 750ml',
    locationId: 'loc-bar-store',
    locationName: 'Main Bar Beverage Station',
    quantityDelta: 3750, // 5 bottles transferred in
    baseUnit: 'ml',
    movementType: 'TRANSFER_IN',
    sourceType: 'TRANSFER',
    sourceId: 'TRF-0081',
    occurredAt: '2026-09-23T01:30:00Z',
    actorUserId: 'emp-storekeeper',
    actorName: 'Peter Kamau (Storekeeper)',
    unitCostSnapshot: 3.73,
    totalCostValuation: 13987.50
  },
  {
    id: 'mvt-1002',
    organizationId: 'org-simba-01',
    propertyId: 'prop-nairobi-01',
    stockItemId: 'stk-tanqueray',
    stockItemName: 'Tanqueray London Dry Gin 1000ml',
    locationId: 'loc-bar-store',
    locationName: 'Main Bar Beverage Station',
    quantityDelta: -60, // 1 G&T served
    baseUnit: 'ml',
    movementType: 'SALE_CONSUMPTION',
    sourceType: 'ORDER',
    sourceId: 'ORD-9018',
    occurredAt: '2026-09-23T02:15:00Z',
    actorUserId: 'emp-bartender',
    actorName: 'David Omondi (Bartender)',
    unitCostSnapshot: 3.20,
    totalCostValuation: 192.00
  },
  {
    id: 'mvt-1003',
    organizationId: 'org-simba-01',
    propertyId: 'prop-nairobi-01',
    stockItemId: 'stk-jameson',
    stockItemName: 'Jameson Irish Whiskey 750ml',
    locationId: 'loc-bar-store',
    locationName: 'Main Bar Beverage Station',
    quantityDelta: -90, // Spillage during shaker break
    baseUnit: 'ml',
    movementType: 'WASTE',
    sourceType: 'WASTE_EVENT',
    sourceId: 'WST-0012',
    reasonCode: 'Spillage / broken jigger',
    occurredAt: '2026-09-23T02:40:00Z',
    actorUserId: 'emp-bartender',
    actorName: 'David Omondi (Bartender)',
    unitCostSnapshot: 3.73,
    totalCostValuation: 335.70
  }
];

const initialAccounts: Account[] = [
  { id: 'acc-1010', code: '1010', name: 'Cash on Hand (Till Drawers)', type: 'ASSET', balance: 45000 },
  { id: 'acc-1020', code: '1020', name: 'M-PESA Clearing Settlement', type: 'ASSET', balance: 285400 },
  { id: 'acc-1030', code: '1030', name: 'Card Settlement Clearing', type: 'ASSET', balance: 192000 },
  { id: 'acc-1100', code: '1100', name: 'Guest Accounts Receivable (Folios)', type: 'ASSET', balance: 78500 },
  { id: 'acc-1200', code: '1200', name: 'Inventory Asset (F&B Stock)', type: 'ASSET', balance: 642100 },
  { id: 'acc-2010', code: '2010', name: 'Accounts Payable (Trade Suppliers)', type: 'LIABILITY', balance: 145000 },
  { id: 'acc-2050', code: '2050', name: 'Guest Advance Deposit Liability', type: 'LIABILITY', balance: 50000 },
  { id: 'acc-2100', code: '2100', name: 'Output VAT Payable (16%)', type: 'LIABILITY', balance: 68420 },
  { id: 'acc-2110', code: '2110', name: 'Catering Levy Payable (2%)', type: 'LIABILITY', balance: 8550 },
  { id: 'acc-4010', code: '4010', name: 'F&B Revenue - Beverage (Bar)', type: 'REVENUE', balance: 345000 },
  { id: 'acc-4020', code: '4020', name: 'F&B Revenue - Kitchen (Grill)', type: 'REVENUE', balance: 184000 },
  { id: 'acc-4050', code: '4050', name: 'Room Accommodation Revenue', type: 'REVENUE', balance: 450000 },
  { id: 'acc-4090', code: '4090', name: 'Minimum Spend Shortfall Revenue', type: 'REVENUE', balance: 25000 },
  { id: 'acc-5010', code: '5010', name: 'Cost of Goods Sold (COGS - Beverage)', type: 'EXPENSE', balance: 112000 },
  { id: 'acc-5020', code: '5020', name: 'Cost of Goods Sold (COGS - Kitchen)', type: 'EXPENSE', balance: 74000 },
  { id: 'acc-5050', code: '5050', name: 'Waste & Spillage Loss', type: 'EXPENSE', balance: 4200 },
  { id: 'acc-5060', code: '5060', name: 'Complimentary & VIP Promo Expense', type: 'EXPENSE', balance: 12500 }
];

const initialJournalEntries: JournalEntry[] = [
  {
    id: 'je-5001',
    entryNumber: 'JE-2026-0923-0001',
    propertyId: 'prop-nairobi-01',
    occurredAt: '2026-09-23T02:15:00Z',
    postedAt: '2026-09-23T02:15:01Z',
    sourceType: 'SALE',
    sourceId: 'ORD-9018',
    memo: 'Order #ORD-9018 settled via M-PESA Daraja (1x Tanqueray G&T)',
    totalDebit: 1042.00,
    totalCredit: 1042.00,
    balanced: true,
    lines: [
      { id: 'jl-1', accountId: 'acc-1020', accountCode: '1020', accountName: 'M-PESA Clearing Settlement', debit: 850.00, credit: 0, description: 'M-PESA received' },
      { id: 'jl-2', accountId: 'acc-4010', accountCode: '4010', accountName: 'F&B Revenue - Beverage (Bar)', debit: 0, credit: 720.34, description: 'Net beverage revenue' },
      { id: 'jl-3', accountId: 'acc-2100', accountCode: '2100', accountName: 'Output VAT Payable (16%)', debit: 0, credit: 115.25, description: '16% Output VAT' },
      { id: 'jl-4', accountId: 'acc-2110', accountCode: '2110', accountName: 'Catering Levy Payable (2%)', debit: 0, credit: 14.41, description: '2% Catering Levy' },
      // COGS posting
      { id: 'jl-5', accountId: 'acc-5010', accountCode: '5010', accountName: 'Cost of Goods Sold (COGS - Beverage)', debit: 192.00, credit: 0, description: 'Tanqueray 60ml cost' },
      { id: 'jl-6', accountId: 'acc-1200', accountCode: '1200', accountName: 'Inventory Asset (F&B Stock)', debit: 0, credit: 192.00, description: 'Inventory depletion' }
    ]
  }
];

const initialTables: RestaurantTable[] = [
  { id: 'tbl-vip-01', propertyId: 'prop-nairobi-01', outletId: 'out-bar-01', label: 'VIP-01 (Lounge)', capacity: 8, section: 'VIP_LOUNGE', state: 'SEATED', minimumSpend: 50000 },
  { id: 'tbl-vip-02', propertyId: 'prop-nairobi-01', outletId: 'out-bar-01', label: 'VIP-02 (Lounge)', capacity: 6, section: 'VIP_LOUNGE', state: 'AVAILABLE', minimumSpend: 50000 },
  { id: 'tbl-main-04', propertyId: 'prop-nairobi-01', outletId: 'out-bar-01', label: 'Table 04', capacity: 4, section: 'MAIN_DECK', state: 'ORDERING' },
  { id: 'tbl-main-05', propertyId: 'prop-nairobi-01', outletId: 'out-bar-01', label: 'Table 05', capacity: 4, section: 'MAIN_DECK', state: 'AVAILABLE' },
  { id: 'tbl-terrace-07', propertyId: 'prop-nairobi-01', outletId: 'out-bar-01', label: 'Terrace 07', capacity: 4, section: 'TERRACE', state: 'SERVED' },
  { id: 'tbl-grill-12', propertyId: 'prop-nairobi-01', outletId: 'out-grill-01', label: 'Grill 12', capacity: 2, section: 'GRILL_ROOM', state: 'AVAILABLE' }
];

const initialHotelRooms: HotelRoom[] = [
  {
    id: 'room-101',
    roomNumber: '101',
    roomTypeId: 'rt-deluxe-king',
    roomTypeName: 'Deluxe King Suite',
    floor: 1,
    status: 'OCCUPIED',
    currentGuestStayId: 'stay-101',
    currentGuestName: 'Dr. Amina Odhiambo',
    minibarItems: [
      { stockItemId: 'stk-tusker', name: 'Tusker 500ml', expectedQty: 2, currentQty: 2, price: 450 },
      { stockItemId: 'stk-jameson', name: 'Jameson 50ml Miniature', expectedQty: 2, currentQty: 2, price: 700 },
      { stockItemId: 'stk-tonic', name: 'Tonic Water Can', expectedQty: 2, currentQty: 2, price: 150 }
    ]
  },
  {
    id: 'room-102',
    roomNumber: '102',
    roomTypeId: 'rt-deluxe-king',
    roomTypeName: 'Deluxe King Suite',
    floor: 1,
    status: 'AVAILABLE',
    minibarItems: [
      { stockItemId: 'stk-tusker', name: 'Tusker 500ml', expectedQty: 2, currentQty: 2, price: 450 },
      { stockItemId: 'stk-jameson', name: 'Jameson 50ml Miniature', expectedQty: 2, currentQty: 2, price: 700 },
      { stockItemId: 'stk-tonic', name: 'Tonic Water Can', expectedQty: 2, currentQty: 2, price: 150 }
    ]
  },
  {
    id: 'room-201',
    roomNumber: '201',
    roomTypeId: 'rt-exec-suite',
    roomTypeName: 'Executive Penthouse',
    floor: 2,
    status: 'OCCUPIED',
    currentGuestStayId: 'stay-201',
    currentGuestName: 'James Mwangi Kariuki',
    minibarItems: [
      { stockItemId: 'stk-tusker', name: 'Tusker 500ml', expectedQty: 4, currentQty: 4, price: 450 },
      { stockItemId: 'stk-jameson', name: 'Jameson 50ml Miniature', expectedQty: 2, currentQty: 2, price: 700 }
    ]
  },
  {
    id: 'room-202',
    roomNumber: '202',
    roomTypeId: 'rt-exec-suite',
    roomTypeName: 'Executive Penthouse',
    floor: 2,
    status: 'DIRTY',
    minibarItems: [
      { stockItemId: 'stk-tusker', name: 'Tusker 500ml', expectedQty: 4, currentQty: 2, price: 450 }
    ]
  },
  {
    id: 'room-301',
    roomNumber: '301',
    roomTypeId: 'rt-deluxe-twin',
    roomTypeName: 'Deluxe Twin Garden',
    floor: 3,
    status: 'CLEANING',
    minibarItems: [
      { stockItemId: 'stk-tusker', name: 'Tusker 500ml', expectedQty: 2, currentQty: 2, price: 450 }
    ]
  },
  {
    id: 'room-302',
    roomNumber: '302',
    roomTypeId: 'rt-deluxe-twin',
    roomTypeName: 'Deluxe Twin Garden',
    floor: 3,
    status: 'OUT_OF_ORDER',
    minibarItems: []
  }
];

const initialGuestStays: GuestStay[] = [
  {
    id: 'stay-101',
    reservationId: 'RES-8910',
    guestName: 'Dr. Amina Odhiambo',
    guestEmail: 'amina.odhiambo@healthcorp.co.ke',
    guestPhone: '+254 722 419 802',
    roomNumber: '101',
    roomTypeId: 'rt-deluxe-king',
    checkInDate: '2026-09-22',
    checkOutDate: '2026-09-25',
    creditLimit: 120000,
    allowRoomCharge: true,
    status: 'CHECKED_IN',
    folioId: 'fol-101'
  },
  {
    id: 'stay-201',
    reservationId: 'RES-8914',
    guestName: 'James Mwangi Kariuki',
    guestEmail: 'j.mwangi@capitaladvisors.ke',
    guestPhone: '+254 711 982 344',
    roomNumber: '201',
    roomTypeId: 'rt-exec-suite',
    checkInDate: '2026-09-21',
    checkOutDate: '2026-09-24',
    creditLimit: 250000,
    allowRoomCharge: true,
    status: 'CHECKED_IN',
    folioId: 'fol-201'
  }
];

const initialGuestFolios: GuestFolio[] = [
  {
    id: 'fol-101',
    stayId: 'stay-101',
    guestName: 'Dr. Amina Odhiambo',
    roomNumber: '101',
    totalCharges: 42000,
    totalPayments: 20000,
    balanceDue: 22000,
    isClosed: false,
    entries: [
      {
        id: 'fe-1',
        folioId: 'fol-101',
        occurredAt: '2026-09-22T14:00:00Z',
        type: 'CHARGE',
        category: 'ROOM',
        description: 'Room Charge - Deluxe King Suite (Night 1)',
        amount: 22000,
        postedBy: 'Front Desk System'
      },
      {
        id: 'fe-2',
        folioId: 'fol-101',
        occurredAt: '2026-09-22T14:10:00Z',
        type: 'PAYMENT',
        category: 'PAYMENT',
        description: 'Advance Deposit - M-PESA Receipt QHM839210K',
        amount: -20000,
        postedBy: 'Cashier Alice'
      },
      {
        id: 'fe-3',
        folioId: 'fol-101',
        occurredAt: '2026-09-22T21:30:00Z',
        type: 'CHARGE',
        category: 'F&B_BAR',
        description: 'Room Charge POS Ref #ORD-9012 (2x Tanqueray G&T)',
        amount: 1700,
        referenceId: 'ORD-9012',
        postedBy: 'Terminal POS-01'
      },
      {
        id: 'fe-4',
        folioId: 'fol-101',
        occurredAt: '2026-09-23T00:00:00Z',
        type: 'CHARGE',
        category: 'ROOM',
        description: 'Room Charge - Deluxe King Suite (Night 2)',
        amount: 22000,
        postedBy: 'Night Audit'
      },
      {
        id: 'fe-5',
        folioId: 'fol-101',
        occurredAt: '2026-09-23T02:00:00Z',
        type: 'CHARGE',
        category: 'MINIBAR',
        description: 'Minibar Consumption (2x Tusker, 1x Tonic)',
        amount: 1050,
        postedBy: 'Housekeeper Mercy'
      }
    ]
  },
  {
    id: 'fol-201',
    stayId: 'stay-201',
    guestName: 'James Mwangi Kariuki',
    roomNumber: '201',
    totalCharges: 68500,
    totalPayments: 50000,
    balanceDue: 18500,
    isClosed: false,
    entries: [
      {
        id: 'fe-201',
        folioId: 'fol-201',
        occurredAt: '2026-09-21T15:00:00Z',
        type: 'CHARGE',
        category: 'ROOM',
        description: 'Executive Penthouse (Night 1 & 2)',
        amount: 60000,
        postedBy: 'Front Desk'
      },
      {
        id: 'fe-202',
        folioId: 'fol-201',
        occurredAt: '2026-09-21T15:15:00Z',
        type: 'PAYMENT',
        category: 'PAYMENT',
        description: 'Corporate Visa Card Pre-auth Settled',
        amount: -50000,
        postedBy: 'Front Desk'
      },
      {
        id: 'fe-203',
        folioId: 'fol-201',
        occurredAt: '2026-09-22T20:15:00Z',
        type: 'CHARGE',
        category: 'F&B_KITCHEN',
        description: 'Kikao Grill Dinner Room Post #ORD-8994',
        amount: 8500,
        referenceId: 'ORD-8994',
        postedBy: 'Waiter Brian'
      }
    ]
  }
];

const initialSuppliers: Supplier[] = [
  {
    id: 'sup-kbl',
    name: 'Kenya Breweries Limited (Diageo)',
    code: 'SUP-KBL-01',
    contactPerson: 'Martin Maina',
    phone: '+254 722 000 111',
    email: 'orders.nairobi@eabl.com',
    kraPin: 'P000600123A',
    paymentTermsDays: 30
  },
  {
    id: 'sup-ead',
    name: 'East African Distillers & Wines',
    code: 'SUP-EAD-02',
    contactPerson: 'Grace Wanjiru',
    phone: '+254 733 445 566',
    email: 'supply@eadistillers.co.ke',
    kraPin: 'P051009876C',
    paymentTermsDays: 14
  }
];

const initialPurchaseOrders: PurchaseOrder[] = [
  {
    id: 'po-3041',
    poNumber: 'PO-2026-0919-01',
    supplierId: 'sup-ead',
    supplierName: 'East African Distillers & Wines',
    propertyId: 'prop-nairobi-01',
    createdAt: '2026-09-19T09:00:00Z',
    status: 'RECEIVED',
    grnNumber: 'GRN-2026-0482',
    supplierInvoiceNumber: 'INV-EAD-98421',
    approvedBy: 'Financial Controller (Hellen)',
    subtotal: 124000,
    taxTotal: 19840,
    grandTotal: 143840,
    items: [
      {
        stockItemId: 'stk-jameson',
        stockItemName: 'Jameson Irish Whiskey 750ml (Case of 12)',
        quantityOrdered: 24, // 24 bottles
        unitPrice: 2800,
        unitSymbol: 'btl',
        lineTotal: 67200,
        quantityReceived: 24,
        quantityRejected: 0
      },
      {
        stockItemId: 'stk-tanqueray',
        stockItemName: 'Tanqueray Gin 1000ml (Case of 12)',
        quantityOrdered: 12,
        unitPrice: 3200,
        unitSymbol: 'btl',
        lineTotal: 38400,
        quantityReceived: 12,
        quantityRejected: 0
      }
    ]
  }
];

const initialEmployees: Employee[] = [
  {
    id: 'emp-dave',
    code: 'EMP-01',
    name: 'David Omondi',
    email: 'david.omondi@grandnairobi.co.ke',
    phone: '+254 722 101 202',
    role: 'BARTENDER',
    permissions: ['order.create', 'order.send', 'payment.cash', 'payment.mpesa'],
    hourlyRate: 350,
    commissionRate: 0.05
  },
  {
    id: 'emp-alice',
    code: 'EMP-02',
    name: 'Alice Wambui',
    email: 'alice.wambui@grandnairobi.co.ke',
    phone: '+254 733 202 303',
    role: 'CASHIER',
    permissions: ['order.create', 'payment.cash', 'payment.mpesa', 'payment.card', 'till.open', 'till.close'],
    hourlyRate: 380,
    commissionRate: 0.02
  },
  {
    id: 'emp-mgr',
    code: 'EMP-03',
    name: 'Marcus Kiprop',
    email: 'marcus.kiprop@grandnairobi.co.ke',
    phone: '+254 711 303 404',
    role: 'MANAGER',
    permissions: ['order.create', 'order.void', 'discount.override', 'comp.apply', 'approval.sign', 'reports.view'],
    hourlyRate: 650,
    commissionRate: 0.08
  },
  {
    id: 'emp-frontdesk',
    code: 'EMP-04',
    name: 'Stella Njeri',
    email: 'stella.njeri@grandnairobi.co.ke',
    phone: '+254 700 404 505',
    role: 'RECEPTIONIST',
    permissions: ['hotel.checkin', 'hotel.checkout', 'folio.charge', 'payment.all'],
    hourlyRate: 400,
    commissionRate: 0.03
  }
];

const initialAlerts: AnomalyAlert[] = [
  {
    id: 'alt-1',
    ruleCode: 'STOCK_VARIANCE_ABOVE_TOLERANCE',
    title: 'Jameson 750ml Variance Exceeds 2.5% Tolerance',
    description: 'Actual vs Theoretical calculation detected an unexplained shortage of 180 ml on Main Bar Beverage Station.',
    severity: 'HIGH',
    evidence: {
      stockItemId: 'stk-jameson',
      expectedValue: '4,380 ml',
      actualValue: '4,200 ml',
      differenceAmount: 180,
      terminalName: 'POS-01 (Main Bar)'
    },
    recommendedAction: 'Verify open bottle handover notes with Bartender David Omondi; check for unrecorded waste or heavy pouring.',
    status: 'OPEN',
    detectedAt: '2026-09-23T02:45:00Z'
  },
  {
    id: 'alt-2',
    ruleCode: 'CASH_DRAWER_VARIANCE',
    title: 'Till #1 Mid-Shift Cash Discrepancy (KES -450)',
    description: 'System expected cash KES 25,450 based on sales minus paid-outs; drawer audit revealed KES 25,000.',
    severity: 'MEDIUM',
    evidence: {
      differenceAmount: 450,
      expectedValue: 'KES 25,450',
      actualValue: 'KES 25,000',
      employeeName: 'Alice Wambui',
      terminalName: 'POS-01 Cash Drawer'
    },
    recommendedAction: 'Re-tally small denomination notes and verify if any emergency ice paid-out voucher was missed.',
    status: 'OPEN',
    detectedAt: '2026-09-23T03:10:00Z'
  },
  {
    id: 'alt-3',
    ruleCode: 'LOW_STOCK_WITH_HIGH_VELOCITY',
    title: 'Tusker 500ml Stock Velocity Spike',
    description: 'Main Bar Store has 96 units remaining with current velocity of 28 units/hr (estimated stockout in 3.4 hrs).',
    severity: 'LOW',
    evidence: {
      stockItemId: 'stk-tusker',
      actualValue: '96 units',
      expectedValue: 'Par: 240 units'
    },
    recommendedAction: 'Execute inter-location stock transfer of 10 cases (240 units) from Central Warehouse depot.',
    status: 'OPEN',
    detectedAt: '2026-09-23T03:30:00Z'
  }
];

const initialApprovals: ApprovalRequest[] = [
  {
    id: 'appr-01',
    actionType: 'COMP_ITEM',
    requestedBy: 'emp-dave',
    requesterName: 'David Omondi',
    details: 'Complimentary Jameson Double (60ml) for VIP Platinum Guest at Table VIP-01',
    amount: 850,
    targetId: 'item-comp-01',
    status: 'PENDING',
    requestedAt: '2026-09-23T03:20:00Z'
  },
  {
    id: 'appr-02',
    actionType: 'DISCOUNT_OVERRIDE',
    requestedBy: 'emp-alice',
    requesterName: 'Alice Wambui',
    details: 'Manager 15% discount for Corporate Board dinner table 04 (Exceeds standard 10% limit)',
    amount: 1250,
    targetId: 'ord-disc-02',
    status: 'PENDING',
    requestedAt: '2026-09-23T03:40:00Z'
  }
];

const initialEdgeDevices: EdgeDevice[] = [
  { id: 'edge-prn-01', name: 'Bar Receipt Printer (Epson TM-T88VI)', type: 'RECEIPT_PRINTER', connection: 'LAN', status: 'ONLINE', lastPing: '2026-09-23T04:00:00Z' },
  { id: 'edge-prn-02', name: 'Kitchen Order Printer (Impact Star SP700)', type: 'KITCHEN_PRINTER', connection: 'LAN', status: 'ONLINE', lastPing: '2026-09-23T04:00:00Z' },
  { id: 'edge-drw-01', name: 'Cash Drawer Port 1 (24V Solenoid)', type: 'CASH_DRAWER', connection: 'USB', status: 'ONLINE', lastPing: '2026-09-23T04:00:00Z' },
  { id: 'edge-scl-01', name: 'Keg Digital Platform Scale (Mettler)', type: 'WEIGHING_SCALE', connection: 'SERIAL', status: 'ONLINE', lastPing: '2026-09-23T04:00:00Z' }
];

export const ServOSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Tenancy & Session
  const [organization] = useState<Organization>(initialOrg);
  const [currentProperty] = useState<Property>(initialProperty);
  const [outlets] = useState<Outlet[]>(initialOutlets);
  const [currentOutlet, setCurrentOutlet] = useState<Outlet>(initialOutlets[0]);
  const [employees] = useState<Employee[]>(initialEmployees);
  const [currentUser, setCurrentUser] = useState<Employee>(initialEmployees[0]);
  const [terminals] = useState<Terminal[]>([
    {
      id: 'term-01',
      propertyId: 'prop-nairobi-01',
      outletId: 'out-bar-01',
      name: 'POS Terminal 01 (Main Bar)',
      hardwareSerial: 'POS-SR-98412',
      isEdgeConnected: true,
      assignedCashierId: 'emp-alice'
    }
  ]);
  const currentTerminal = terminals[0];

  // Catalog & Inventory
  const [stockItems, setStockItems] = useState<StockItem[]>(initialStockItems);
  const [stockLocations] = useState<StockLocation[]>(initialStockLocations);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>(initialStockMovements);
  const [products] = useState<ProductSellable[]>(initialProducts);

  // Orders, Tables & Tabs
  const [tables, setTables] = useState<RestaurantTable[]>(initialTables);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);

  // Payments & Cash
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [tillSession, setTillSession] = useState<TillSession | null>({
    id: 'till-2026-0923-01',
    terminalId: 'term-01',
    terminalName: 'POS Terminal 01 (Main Bar)',
    employeeId: 'emp-alice',
    employeeName: 'Alice Wambui',
    openedAt: '2026-09-23T00:00:00Z',
    openingFloat: 10000,
    cashSalesTotal: 15450,
    cashPaidIn: 0,
    cashPaidOut: 450,
    expectedCashInDrawer: 25000,
    status: 'OPEN'
  });

  // Accounting Ledger & Fiscal
  const [accounts, setAccounts] = useState<Account[]>(initialAccounts);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>(initialJournalEntries);
  const [etimsInvoices, setEtimsInvoices] = useState<EtimsFiscalInvoice[]>([]);

  // Hotel PMS
  const [hotelRooms, setHotelRooms] = useState<HotelRoom[]>(initialHotelRooms);
  const [guestStays, setGuestStays] = useState<GuestStay[]>(initialGuestStays);
  const [guestFolios, setGuestFolios] = useState<GuestFolio[]>(initialGuestFolios);

  // Procurement
  const [suppliers] = useState<Supplier[]>(initialSuppliers);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(initialPurchaseOrders);

  // Control Engine
  const [anomalyAlerts, setAnomalyAlerts] = useState<AnomalyAlert[]>(initialAlerts);
  const [approvalRequests, setApprovalRequests] = useState<ApprovalRequest[]>(initialApprovals);

  // Offline & Edge
  const [isOffline, setIsOffline] = useState<boolean>(false);
  const [offlineQueue, setOfflineQueue] = useState<Order[]>([]);
  const [edgeDevices] = useState<EdgeDevice[]>(initialEdgeDevices);
  const [lastEdgeEvent, setLastEdgeEvent] = useState<string | null>(null);

  // Load / initialize active table order on startup
  useEffect(() => {
    // create a default open table order for VIP-01 if none exists
    const orderNum = `ORD-9020`;
    const newOrd: Order = {
      id: 'ord-demo-vip01',
      orderNumber: orderNum,
      propertyId: currentProperty.id,
      outletId: currentOutlet.id,
      terminalId: currentTerminal.id,
      tableId: 'tbl-vip-01',
      tableName: 'VIP-01 (Lounge)',
      tabName: 'Table VIP-01 Tab',
      serverEmployeeId: currentUser.id,
      serverName: currentUser.name,
      state: 'OPEN',
      items: [
        {
          id: 'item-1',
          productId: 'prod-tanq-gt',
          productName: 'Tanqueray Classic G&T',
          quantity: 2,
          unitPrice: 850,
          taxAmount: 230.50,
          cateringLevy: 28.80,
          totalPrice: 1700,
          modifiers: [],
          state: 'SERVED',
          sentAt: '2026-09-23T02:00:00Z'
        },
        {
          id: 'item-2',
          productId: 'prod-jam-double',
          productName: 'Jameson Double (60ml)',
          portionName: '60ml Double',
          quantity: 1,
          unitPrice: 850,
          taxAmount: 115.25,
          cateringLevy: 14.41,
          totalPrice: 850,
          modifiers: [],
          state: 'SERVED',
          sentAt: '2026-09-23T02:10:00Z'
        }
      ],
      subtotal: 2161.70,
      taxTotal: 345.75,
      cateringLevyTotal: 43.21,
      shortfallAdjustment: 0,
      discountTotal: 0,
      grandTotal: 2550,
      amountPaid: 0,
      createdAt: '2026-09-23T02:00:00Z'
    };
    setOrders([newOrd]);
    setActiveOrder(newOrd);
  }, []);

  // Recalculate order totals helper
  const calculateTotals = (items: OrderItem[], discountTotal: number = 0, minSpend: number = 0) => {
    let itemsTotal = 0;
    items.forEach(it => {
      if (!it.isComp) {
        itemsTotal += it.totalPrice;
      }
    });

    const netCharge = Math.max(0, itemsTotal - discountTotal);
    // Kenyan tax calculations: 16% VAT + 2% Catering Levy (included in gross price)
    // Gross = Net / 1.18 * 1.18
    const baseExTax = netCharge / 1.18;
    const taxTotal = baseExTax * 0.16;
    const cateringLevyTotal = baseExTax * 0.02;

    // Minimum spend shortfall check (Section 11, 25)
    let shortfall = 0;
    if (minSpend > 0 && netCharge < minSpend) {
      shortfall = minSpend - netCharge;
    }

    const grandTotal = netCharge + shortfall;

    return {
      subtotal: Math.round(baseExTax * 100) / 100,
      taxTotal: Math.round(taxTotal * 100) / 100,
      cateringLevyTotal: Math.round(cateringLevyTotal * 100) / 100,
      shortfallAdjustment: shortfall,
      grandTotal: Math.round(grandTotal)
    };
  };

  // Order Actions
  const createOrderForTable = (tableId: string): Order => {
    const table = tables.find(t => t.id === tableId);
    const orderNumber = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber,
      propertyId: currentProperty.id,
      outletId: currentOutlet.id,
      terminalId: currentTerminal.id,
      tableId,
      tableName: table ? table.label : 'Table',
      tabName: table ? `${table.label} Tab` : 'Bar Tab',
      serverEmployeeId: currentUser.id,
      serverName: currentUser.name,
      state: 'DRAFT',
      items: [],
      subtotal: 0,
      taxTotal: 0,
      cateringLevyTotal: 0,
      shortfallAdjustment: 0,
      discountTotal: 0,
      grandTotal: 0,
      amountPaid: 0,
      createdAt: new Date().toISOString()
    };

    setOrders(prev => [newOrder, ...prev]);
    setActiveOrder(newOrder);

    // Update table state to ORDERING
    if (table) {
      setTables(prev =>
        prev.map(t =>
          t.id === tableId ? { ...t, state: 'ORDERING', currentOrderId: newOrder.id } : t
        )
      );
    }
    return newOrder;
  };

  const createQuickBarTab = (tabName = 'Walk-in Bar Tab'): Order => {
    const orderNumber = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber,
      propertyId: currentProperty.id,
      outletId: currentOutlet.id,
      terminalId: currentTerminal.id,
      tabName,
      serverEmployeeId: currentUser.id,
      serverName: currentUser.name,
      state: 'DRAFT',
      items: [],
      subtotal: 0,
      taxTotal: 0,
      cateringLevyTotal: 0,
      shortfallAdjustment: 0,
      discountTotal: 0,
      grandTotal: 0,
      amountPaid: 0,
      createdAt: new Date().toISOString()
    };

    setOrders(prev => [newOrder, ...prev]);
    setActiveOrder(newOrder);
    return newOrder;
  };

  const selectOrder = (orderId: string) => {
    const ord = orders.find(o => o.id === orderId);
    if (ord) setActiveOrder(ord);
  };

  const addItemToOrder = (
    productId: string,
    portionVolume?: number,
    modifiers?: { modifierId: string; name: string; priceDelta: number }[],
    selectedMixers?: string[]
  ) => {
    let current = activeOrder;
    if (!current) {
      current = createQuickBarTab('Quick Counter Sale');
    }

    const prod = products.find(p => p.id === productId);
    if (!prod) return;

    let unitPrice = prod.price;
    if (modifiers && modifiers.length > 0) {
      const modTotal = modifiers.reduce((acc, m) => acc + m.priceDelta, 0);
      unitPrice += modTotal;
    }

    const newItem: OrderItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      productId: prod.id,
      productName: prod.name,
      portionName: prod.portionUnitSymbol ? `${portionVolume || prod.portionVolume} ${prod.portionUnitSymbol}` : undefined,
      quantity: 1,
      unitPrice,
      taxAmount: Math.round((unitPrice / 1.18 * 0.16) * 100) / 100,
      cateringLevy: Math.round((unitPrice / 1.18 * 0.02) * 100) / 100,
      totalPrice: unitPrice,
      modifiers: modifiers || [],
      selectedMixers: selectedMixers || [],
      state: 'OPEN',
      sentAt: undefined
    };

    const newItems = [...current.items, newItem];
    const table = current.tableId ? tables.find(t => t.id === current?.tableId) : undefined;
    const totals = calculateTotals(newItems, current.discountTotal, table?.minimumSpend || 0);

    const updatedOrder: Order = {
      ...current,
      state: current.state === 'DRAFT' ? 'OPEN' : current.state,
      items: newItems,
      ...totals
    };

    setActiveOrder(updatedOrder);
    setOrders(prev => prev.map(o => (o.id === updatedOrder.id ? updatedOrder : o)));
  };

  const removeItemFromOrder = (itemId: string) => {
    if (!activeOrder) return;
    const newItems = activeOrder.items.filter(i => i.id !== itemId);
    const table = activeOrder.tableId ? tables.find(t => t.id === activeOrder?.tableId) : undefined;
    const totals = calculateTotals(newItems, activeOrder.discountTotal, table?.minimumSpend || 0);

    const updated: Order = {
      ...activeOrder,
      items: newItems,
      ...totals
    };
    setActiveOrder(updated);
    setOrders(prev => prev.map(o => (o.id === updated.id ? updated : o)));
  };

  const sendOrderToKitchenAndBar = () => {
    if (!activeOrder || activeOrder.items.length === 0) return;

    const now = new Date().toISOString();
    const routedItems = activeOrder.items.map(it => ({
      ...it,
      state: it.state === 'OPEN' ? ('ROUTED' as const) : it.state,
      sentAt: it.sentAt || now
    }));

    const updated: Order = {
      ...activeOrder,
      state: 'SENT',
      items: routedItems
    };

    setActiveOrder(updated);
    setOrders(prev => prev.map(o => (o.id === updated.id ? updated : o)));

    // Emit Edge print signal for kitchen/bar pass tickets
    triggerEdgePrint('KITCHEN_TICKET', {
      orderNumber: updated.orderNumber,
      tableName: updated.tableName,
      server: updated.serverName,
      items: routedItems
    });
  };

  const applyCompToItem = (itemId: string, reason: string) => {
    if (!activeOrder) return;
    const newItems = activeOrder.items.map(it => {
      if (it.id === itemId) {
        return {
          ...it,
          isComp: true,
          compReason: reason,
          compApprovedBy: currentUser.name
        };
      }
      return it;
    });

    const table = activeOrder.tableId ? tables.find(t => t.id === activeOrder?.tableId) : undefined;
    const totals = calculateTotals(newItems, activeOrder.discountTotal, table?.minimumSpend || 0);
    const updated: Order = {
      ...activeOrder,
      items: newItems,
      ...totals
    };

    setActiveOrder(updated);
    setOrders(prev => prev.map(o => (o.id === updated.id ? updated : o)));
  };

  const applyOrderDiscount = (discountPct: number, reason: string) => {
    if (!activeOrder) return;
    const rawTotal = activeOrder.items.reduce((acc, it) => acc + (it.isComp ? 0 : it.totalPrice), 0);
    const discountAmount = Math.round((rawTotal * (discountPct / 100)));
    const table = activeOrder.tableId ? tables.find(t => t.id === activeOrder?.tableId) : undefined;
    const totals = calculateTotals(activeOrder.items, discountAmount, table?.minimumSpend || 0);

    const updated: Order = {
      ...activeOrder,
      discountTotal: discountAmount,
      discountReason: reason,
      ...totals
    };

    setActiveOrder(updated);
    setOrders(prev => prev.map(o => (o.id === updated.id ? updated : o)));
  };

  const voidOrder = (orderId: string, reason: string) => {
    setOrders(prev =>
      prev.map(o => {
        if (o.id === orderId) {
          return {
            ...o,
            state: 'VOIDED',
            discountReason: `VOIDED: ${reason} (by ${currentUser.name})`
          };
        }
        return o;
      })
    );
    if (activeOrder?.id === orderId) {
      setActiveOrder(null);
    }
  };

  const transferOrderToTable = (orderId: string, newTableId: string) => {
    const targetTable = tables.find(t => t.id === newTableId);
    if (!targetTable) return;

    const ord = orders.find(o => o.id === orderId);
    if (!ord) return;

    const oldTableId = ord.tableId;

    // Recalculate totals if target table has different minimum spend
    const totals = calculateTotals(ord.items, ord.discountTotal, targetTable.minimumSpend || 0);

    const updatedOrder: Order = {
      ...ord,
      tableId: newTableId,
      tableName: targetTable.label,
      ...totals
    };

    setOrders(prev => prev.map(o => (o.id === orderId ? updatedOrder : o)));
    if (activeOrder?.id === orderId) {
      setActiveOrder(updatedOrder);
    }

    setTables(prev =>
      prev.map(t => {
        if (t.id === oldTableId) {
          return { ...t, currentOrderId: undefined, state: 'AVAILABLE' };
        }
        if (t.id === newTableId) {
          return { ...t, currentOrderId: orderId, state: 'ORDERING' };
        }
        return t;
      })
    );
  };

  // Helper: execute stock depletion for an order
  const depleteInventoryForOrder = (order: Order) => {
    const newMovements: StockMovement[] = [];
    const locationId = currentOutlet.defaultStockLocationId;
    const location = stockLocations.find(l => l.id === locationId);
    const now = new Date().toISOString();

    order.items.forEach(item => {
      const prod = products.find(p => p.id === item.productId);
      if (!prod) return;

      // 1. Direct measured portion or stock item (e.g. Jameson Shot 30ml, Double 60ml, Bottle 750ml, Tusker 1 unit)
      if (prod.stockItemId) {
        const stk = stockItems.find(s => s.id === prod.stockItemId);
        if (stk) {
          const qty = (prod.portionVolume || 1) * item.quantity;
          const costVal = Math.round(qty * stk.averageUnitCost * 100) / 100;

          newMovements.push({
            id: `mvt-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            organizationId: organization.id,
            propertyId: currentProperty.id,
            stockItemId: stk.id,
            stockItemName: stk.name,
            locationId: locationId,
            locationName: location?.name || 'Outlet Stock',
            quantityDelta: -qty,
            baseUnit: stk.baseUnit,
            movementType: item.isComp ? 'COMP_CONSUMPTION' : 'SALE_CONSUMPTION',
            sourceType: 'ORDER',
            sourceId: order.orderNumber,
            reasonCode: item.isComp ? `Comp: ${item.compReason}` : 'POS Sale Depletion',
            occurredAt: now,
            actorUserId: currentUser.id,
            actorName: currentUser.name,
            unitCostSnapshot: stk.averageUnitCost,
            totalCostValuation: costVal
          });
        }
      }

      // 2. Recipe items (e.g. Tanqueray G&T: 60ml Gin, 1 can Tonic, 0.5 Lime)
      if (prod.recipeIngredients && prod.recipeIngredients.length > 0) {
        prod.recipeIngredients.forEach(ing => {
          const stk = stockItems.find(s => s.id === ing.stockItemId);
          if (stk) {
            let qty = ing.quantity * item.quantity;

            // Check if modifiers alter this ingredient (e.g. +30ml extra gin)
            item.modifiers.forEach(mod => {
              const originalMod = prod.modifiers?.find(m => m.id === mod.modifierId);
              if (originalMod) {
                const adj = originalMod.ingredientAdjustments.find(a => a.stockItemId === stk.id);
                if (adj) {
                  qty += adj.quantityDelta * item.quantity;
                }
              }
            });

            if (qty > 0) {
              const costVal = Math.round(qty * stk.averageUnitCost * 100) / 100;
              newMovements.push({
                id: `mvt-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
                organizationId: organization.id,
                propertyId: currentProperty.id,
                stockItemId: stk.id,
                stockItemName: stk.name,
                locationId: locationId,
                locationName: location?.name || 'Outlet Stock',
                quantityDelta: -qty,
                baseUnit: stk.baseUnit,
                movementType: item.isComp ? 'COMP_CONSUMPTION' : 'SALE_CONSUMPTION',
                sourceType: 'ORDER',
                sourceId: order.orderNumber,
                reasonCode: 'Recipe Consumption',
                occurredAt: now,
                actorUserId: currentUser.id,
                actorName: currentUser.name,
                unitCostSnapshot: stk.averageUnitCost,
                totalCostValuation: costVal
              });
            }
          }
        });
      }
    });

    // Update stock levels in stockItems state
    setStockItems(prev =>
      prev.map(stk => {
        const itemMovements = newMovements.filter(m => m.stockItemId === stk.id);
        if (itemMovements.length === 0) return stk;

        const totalDelta = itemMovements.reduce((acc, m) => acc + m.quantityDelta, 0);
        const locStock = stk.currentStock[locationId] || 0;
        return {
          ...stk,
          currentStock: {
            ...stk.currentStock,
            [locationId]: Math.max(0, locStock + totalDelta)
          }
        };
      })
    );

    setStockMovements(prev => [...newMovements, ...prev]);
    return newMovements;
  };

  // Helper: execute Double-Entry Accounting Journal Posting (Section 19 & 34)
  const postOrderToGeneralLedger = (
    order: Order,
    tenderType: 'CASH' | 'MPESA' | 'CARD' | 'ROOM_CHARGE',
    stockMovementsCreated: StockMovement[]
  ): JournalEntry => {
    const now = new Date().toISOString();
    const entryNumber = `JE-2026-${Math.floor(10000 + Math.random() * 90000)}`;

    const lines: JournalLine[] = [];
    let totalDebit = 0;
    let totalCredit = 0;

    // 1. Debit Clearing / Tender Account
    let clearingAccountId = 'acc-1010'; // default cash
    let clearingCode = '1010';
    let clearingName = 'Cash on Hand (Till Drawers)';

    if (tenderType === 'MPESA') {
      clearingAccountId = 'acc-1020';
      clearingCode = '1020';
      clearingName = 'M-PESA Clearing Settlement';
    } else if (tenderType === 'CARD') {
      clearingAccountId = 'acc-1030';
      clearingCode = '1030';
      clearingName = 'Card Settlement Clearing';
    } else if (tenderType === 'ROOM_CHARGE') {
      clearingAccountId = 'acc-1100';
      clearingCode = '1100';
      clearingName = 'Guest Accounts Receivable (Folios)';
    }

    // Debit payment amount
    lines.push({
      id: `jl-${Date.now()}-1`,
      accountId: clearingAccountId,
      accountCode: clearingCode,
      accountName: clearingName,
      debit: order.grandTotal,
      credit: 0,
      description: `Settlement for Order #${order.orderNumber} via ${tenderType}`
    });
    totalDebit += order.grandTotal;

    // 2. Credit Revenue Accounts (Split by Bar vs Food)
    const netBarRevenue = Math.round(order.subtotal * 100) / 100;
    lines.push({
      id: `jl-${Date.now()}-2`,
      accountId: 'acc-4010',
      accountCode: '4010',
      accountName: 'F&B Revenue - Beverage (Bar)',
      debit: 0,
      credit: netBarRevenue,
      description: `Gross net revenue for ${order.orderNumber}`
    });
    totalCredit += netBarRevenue;

    // 3. Credit Output Tax
    if (order.taxTotal > 0) {
      lines.push({
        id: `jl-${Date.now()}-3`,
        accountId: 'acc-2100',
        accountCode: '2100',
        accountName: 'Output VAT Payable (16%)',
        debit: 0,
        credit: order.taxTotal,
        description: `16% VAT on Order #${order.orderNumber}`
      });
      totalCredit += order.taxTotal;
    }

    if (order.cateringLevyTotal > 0) {
      lines.push({
        id: `jl-${Date.now()}-4`,
        accountId: 'acc-2110',
        accountCode: '2110',
        accountName: 'Catering Levy Payable (2%)',
        debit: 0,
        credit: order.cateringLevyTotal,
        description: `2% Catering Levy on Order #${order.orderNumber}`
      });
      totalCredit += order.cateringLevyTotal;
    }

    // 4. Minimum spend shortfall if applicable
    if (order.shortfallAdjustment > 0) {
      lines.push({
        id: `jl-${Date.now()}-5`,
        accountId: 'acc-4090',
        accountCode: '4090',
        accountName: 'Minimum Spend Shortfall Revenue',
        debit: 0,
        credit: order.shortfallAdjustment,
        description: `VIP Minimum spend table shortfall on ${order.tableName}`
      });
      totalCredit += order.shortfallAdjustment;
    }

    // Balance check correction for rounding minor cents
    const diff = Math.round((totalDebit - totalCredit) * 100) / 100;
    if (Math.abs(diff) > 0 && Math.abs(diff) < 2) {
      // absorb rounding cent into beverage revenue
      const revLine = lines.find(l => l.accountCode === '4010');
      if (revLine) {
        revLine.credit += diff;
        totalCredit += diff;
      }
    }

    // 5. Cost of Goods Sold (COGS) vs Inventory
    const totalCogs = stockMovementsCreated.reduce((acc, m) => acc + m.totalCostValuation, 0);
    if (totalCogs > 0) {
      lines.push({
        id: `jl-${Date.now()}-cogs`,
        accountId: 'acc-5010',
        accountCode: '5010',
        accountName: 'Cost of Goods Sold (COGS - Beverage)',
        debit: totalCogs,
        credit: 0,
        description: `Inventory cost consumption for Order #${order.orderNumber}`
      });
      totalDebit += totalCogs;

      lines.push({
        id: `jl-${Date.now()}-inv`,
        accountId: 'acc-1200',
        accountCode: '1200',
        accountName: 'Inventory Asset (F&B Stock)',
        debit: 0,
        credit: totalCogs,
        description: `Depletion of bar inventory for Order #${order.orderNumber}`
      });
      totalCredit += totalCogs;
    }

    const journalEntry: JournalEntry = {
      id: `je-${Date.now()}`,
      entryNumber,
      propertyId: currentProperty.id,
      occurredAt: now,
      postedAt: now,
      sourceType: 'SALE',
      sourceId: order.orderNumber,
      memo: `Sale order #${order.orderNumber} settled via ${tenderType}`,
      lines,
      totalDebit: Math.round(totalDebit * 100) / 100,
      totalCredit: Math.round(totalCredit * 100) / 100,
      balanced: Math.abs(totalDebit - totalCredit) < 0.05
    };

    setJournalEntries(prev => [journalEntry, ...prev]);

    // Update account balances
    setAccounts(prev =>
      prev.map(acc => {
        const debitLines = lines.filter(l => l.accountId === acc.id);
        const creditLines = lines.filter(l => l.accountId === acc.id);
        const sumDebit = debitLines.reduce((s, l) => s + l.debit, 0);
        const sumCredit = creditLines.reduce((s, l) => s + l.credit, 0);

        if (acc.type === 'ASSET' || acc.type === 'EXPENSE') {
          return { ...acc, balance: acc.balance + sumDebit - sumCredit };
        } else {
          return { ...acc, balance: acc.balance + sumCredit - sumDebit };
        }
      })
    );

    return journalEntry;
  };

  // Helper: generate Kenya eTIMS Fiscal Invoice (Section 20)
  const generateEtimsFiscalInvoice = (order: Order): EtimsFiscalInvoice => {
    const invNum = `INV-2026-${Math.floor(100000 + Math.random() * 900000)}`;
    const qrUrl = `https://itax.kra.go.ke/etims/verify?cu=${currentProperty.etimsCuNumber}&inv=${invNum}&amt=${order.grandTotal}&pin=${currentProperty.kraPin}`;

    const fiscalInv: EtimsFiscalInvoice = {
      id: `etims-${Date.now()}`,
      orderId: order.id,
      invoiceNumber: invNum,
      cuSerialNumber: currentProperty.etimsCuNumber,
      customerPin: undefined,
      taxableAmount: order.subtotal,
      vatAmount: order.taxTotal,
      levyAmount: order.cateringLevyTotal,
      totalAmount: order.grandTotal,
      qrCodeUrl: qrUrl,
      fiscalDate: new Date().toISOString(),
      status: 'FISCALIZED',
      verificationHash: `KRA-HASH-${Math.random().toString(36).substring(2, 10).toUpperCase()}`
    };

    setEtimsInvoices(prev => [fiscalInv, ...prev]);
    return fiscalInv;
  };

  // Payment processing with M-PESA STK emulator, Cash drawer, Room Charge
  const processPayment = async (
    orderId: string,
    tenderType: 'CASH' | 'MPESA' | 'CARD' | 'ROOM_CHARGE',
    amount: number,
    options?: {
      phoneNumber?: string;
      cashTendered?: number;
      guestStayId?: string;
      cardAuthCode?: string;
    }
  ): Promise<{ success: boolean; message: string; receipt?: string }> => {
    const order = orders.find(o => o.id === orderId) || activeOrder;
    if (!order) return { success: false, message: 'Order not found' };

    // Check if offline
    if (isOffline) {
      if (tenderType === 'MPESA') {
        return {
          success: false,
          message: 'Offline Mode: Electronic M-PESA Daraja push requires internet connectivity. Please use Cash or queue transaction.'
        };
      }
      // If Cash or room charge offline queueing
      const offlineOrder: Order = {
        ...order,
        state: 'COMPLETED',
        amountPaid: amount,
        paymentMethod: tenderType,
        isOfflineCreated: true
      };
      setOfflineQueue(prev => [...prev, offlineOrder]);
      setActiveOrder(null);
      return {
        success: true,
        message: 'Order saved to local offline queue (will sync automatically upon network reconnection).'
      };
    }

    // 1. M-PESA Daraja Flow Simulation
    let providerRef = `CASH-${Math.floor(10000 + Math.random() * 90000)}`;
    let mpesaReceipt = '';

    if (tenderType === 'MPESA') {
      // Simulate Safaricom Daraja STK Push latency & response
      const phone = options?.phoneNumber || '+254712345678';
      mpesaReceipt = `QHK${Math.floor(1000000 + Math.random() * 9000000)}`;
      providerRef = mpesaReceipt;
    } else if (tenderType === 'CARD') {
      providerRef = `AUTH-${options?.cardAuthCode || Math.floor(100000 + Math.random() * 900000)}`;
    } else if (tenderType === 'ROOM_CHARGE') {
      if (!options?.guestStayId) {
        return { success: false, message: 'Please select a hotel room stay for room charge' };
      }
      const stay = guestStays.find(s => s.id === options.guestStayId);
      if (!stay) {
        return { success: false, message: 'Guest stay record not found' };
      }
      if (!stay.allowRoomCharge) {
        return { success: false, message: 'Guest has no room-charge privileges enabled' };
      }

      const folio = guestFolios.find(f => f.stayId === stay.id);
      if (folio && folio.balanceDue + amount > stay.creditLimit) {
        // Trigger alert for credit breach
        const alert: AnomalyAlert = {
          id: `alt-${Date.now()}`,
          ruleCode: 'CREDIT_LIMIT_BREACH',
          title: `Room Charge Credit Limit Exceeded (${stay.roomNumber})`,
          description: `Attempted to charge KES ${amount} to Room ${stay.roomNumber} (${stay.guestName}), exceeding limit of KES ${stay.creditLimit}.`,
          severity: 'HIGH',
          evidence: {
            differenceAmount: folio.balanceDue + amount - stay.creditLimit,
            employeeName: currentUser.name,
            expectedValue: `Limit: KES ${stay.creditLimit}`,
            actualValue: `Requested: KES ${folio.balanceDue + amount}`
          },
          recommendedAction: 'Require guest to settle partial folio balance at front desk before additional charges.',
          status: 'OPEN',
          detectedAt: new Date().toISOString()
        };
        setAnomalyAlerts(prev => [alert, ...prev]);
        return {
          success: false,
          message: `Room charge declined: Room ${stay.roomNumber} credit limit of KES ${stay.creditLimit.toLocaleString()} would be exceeded.`
        };
      }

      // Add Folio Charge Entry
      const entry: FolioEntry = {
        id: `fe-${Date.now()}`,
        folioId: stay.folioId,
        occurredAt: new Date().toISOString(),
        type: 'CHARGE',
        category: 'F&B_BAR',
        description: `Bar Order #${order.orderNumber} - ${currentOutlet.name}`,
        amount,
        referenceId: order.orderNumber,
        postedBy: `${currentUser.name} (${currentTerminal.name})`
      };

      setGuestFolios(prev =>
        prev.map(f => {
          if (f.id === stay.folioId) {
            return {
              ...f,
              entries: [entry, ...f.entries],
              totalCharges: f.totalCharges + amount,
              balanceDue: f.balanceDue + amount
            };
          }
          return f;
        })
      );
      providerRef = `FOLIO-${stay.roomNumber}`;
    }

    // 2. Deplete Stock
    const movements = depleteInventoryForOrder(order);

    // 3. Post to General Ledger (Double-Entry Engine)
    const journalEntry = postOrderToGeneralLedger(order, tenderType, movements);

    // 4. Kenya eTIMS Fiscal Invoice
    const fiscalInvoice = generateEtimsFiscalInvoice(order);

    // 5. Payment Record
    const paymentRecord: PaymentRecord = {
      id: `pay-${Date.now()}`,
      orderId: order.id,
      propertyId: currentProperty.id,
      tenderType,
      amount,
      currency: 'KES',
      status: 'PAID',
      referenceNumber: providerRef,
      providerMetadata: {
        mpesaReceipt: mpesaReceipt || undefined,
        phoneNumber: options?.phoneNumber,
        cardAuthCode: options?.cardAuthCode
      },
      cashTendered: options?.cashTendered,
      changeGiven: options?.cashTendered ? Math.max(0, options.cashTendered - amount) : undefined,
      occurredAt: new Date().toISOString(),
      cashierId: currentUser.id,
      cashierName: currentUser.name
    };
    setPayments(prev => [paymentRecord, ...prev]);

    // 6. Update Till Session if cash
    if (tenderType === 'CASH' && tillSession && tillSession.status === 'OPEN') {
      setTillSession({
        ...tillSession,
        cashSalesTotal: tillSession.cashSalesTotal + amount,
        expectedCashInDrawer: tillSession.expectedCashInDrawer + amount
      });
      // Physical cash drawer kick via Edge Agent
      triggerCashDrawerKick();
    }

    // 7. Complete the Order
    const completedOrder: Order = {
      ...order,
      state: 'COMPLETED',
      amountPaid: amount,
      completedAt: new Date().toISOString(),
      paymentMethod: tenderType,
      etimsInvoiceNumber: fiscalInvoice.invoiceNumber,
      etimsQrCode: fiscalInvoice.qrCodeUrl,
      journalEntryId: journalEntry.id
    };

    setOrders(prev => prev.map(o => (o.id === order.id ? completedOrder : o)));
    setActiveOrder(null);

    // Free table if associated
    if (order.tableId) {
      setTables(prev =>
        prev.map(t =>
          t.id === order.tableId ? { ...t, state: 'CLEANING', currentOrderId: undefined } : t
        )
      );
    }

    // Hardware Edge Receipt Print
    triggerEdgePrint('RECEIPT', {
      orderNumber: completedOrder.orderNumber,
      fiscalInvoiceNumber: fiscalInvoice.invoiceNumber,
      cuNumber: fiscalInvoice.cuSerialNumber,
      total: completedOrder.grandTotal,
      tender: tenderType,
      reference: providerRef,
      qrUrl: fiscalInvoice.qrCodeUrl
    });

    return {
      success: true,
      message: `Payment successful via ${tenderType}. Order #${completedOrder.orderNumber} completed. eTIMS Invoice ${fiscalInvoice.invoiceNumber} generated.`,
      receipt: providerRef
    };
  };

  // Till Session Management
  const openTillSession = (floatAmount: number) => {
    const session: TillSession = {
      id: `till-${Date.now()}`,
      terminalId: currentTerminal.id,
      terminalName: currentTerminal.name,
      employeeId: currentUser.id,
      employeeName: currentUser.name,
      openedAt: new Date().toISOString(),
      openingFloat: floatAmount,
      cashSalesTotal: 0,
      cashPaidIn: 0,
      cashPaidOut: 0,
      expectedCashInDrawer: floatAmount,
      status: 'OPEN'
    };
    setTillSession(session);
  };

  const closeTillSession = (countedCash: number) => {
    if (!tillSession) return;
    const variance = countedCash - tillSession.expectedCashInDrawer;

    const closed: TillSession = {
      ...tillSession,
      countedCashAtClose: countedCash,
      cashVariance: variance,
      closedAt: new Date().toISOString(),
      status: 'CLOSED'
    };
    setTillSession(closed);

    // If variance is non-zero, trigger an anomaly alert!
    if (Math.abs(variance) > 50) {
      const alert: AnomalyAlert = {
        id: `alt-${Date.now()}`,
        ruleCode: 'CASH_DRAWER_VARIANCE',
        title: `Cash Drawer Close Discrepancy (KES ${variance})`,
        description: `Till closed by ${currentUser.name}. Expected KES ${tillSession.expectedCashInDrawer.toLocaleString()}, counted KES ${countedCash.toLocaleString()}.`,
        severity: Math.abs(variance) > 500 ? 'HIGH' : 'MEDIUM',
        evidence: {
          differenceAmount: variance,
          expectedValue: `KES ${tillSession.expectedCashInDrawer}`,
          actualValue: `KES ${countedCash}`,
          employeeName: currentUser.name,
          terminalName: tillSession.terminalName
        },
        recommendedAction: 'Manager reconciliation required; review non-sale paid in/out log before releasing drawer.',
        status: 'OPEN',
        detectedAt: new Date().toISOString()
      };
      setAnomalyAlerts(prev => [alert, ...prev]);
    }
  };

  const recordCashPaidInOut = (type: 'IN' | 'OUT', amount: number, reason: string) => {
    if (!tillSession || tillSession.status !== 'OPEN') return;
    setTillSession({
      ...tillSession,
      cashPaidIn: type === 'IN' ? tillSession.cashPaidIn + amount : tillSession.cashPaidIn,
      cashPaidOut: type === 'OUT' ? tillSession.cashPaidOut + amount : tillSession.cashPaidOut,
      expectedCashInDrawer:
        type === 'IN'
          ? tillSession.expectedCashInDrawer + amount
          : tillSession.expectedCashInDrawer - amount
    });
  };

  // Stock Actions (Transfers, Waste, Adjustments)
  const transferStock = (
    stockItemId: string,
    fromLocId: string,
    toLocId: string,
    quantity: number,
    reason: string
  ) => {
    const stk = stockItems.find(s => s.id === stockItemId);
    const fromLoc = stockLocations.find(l => l.id === fromLocId);
    const toLoc = stockLocations.find(l => l.id === toLocId);
    if (!stk || !fromLoc || !toLoc) return;

    const now = new Date().toISOString();
    const costVal = Math.round(quantity * stk.averageUnitCost * 100) / 100;
    const transferId = `TRF-${Math.floor(1000 + Math.random() * 9000)}`;

    const outMvt: StockMovement = {
      id: `mvt-${Date.now()}-out`,
      organizationId: organization.id,
      propertyId: currentProperty.id,
      stockItemId: stk.id,
      stockItemName: stk.name,
      locationId: fromLocId,
      locationName: fromLoc.name,
      quantityDelta: -quantity,
      baseUnit: stk.baseUnit,
      movementType: 'TRANSFER_OUT',
      sourceType: 'TRANSFER',
      sourceId: transferId,
      reasonCode: reason,
      occurredAt: now,
      actorUserId: currentUser.id,
      actorName: currentUser.name,
      unitCostSnapshot: stk.averageUnitCost,
      totalCostValuation: costVal
    };

    const inMvt: StockMovement = {
      id: `mvt-${Date.now()}-in`,
      organizationId: organization.id,
      propertyId: currentProperty.id,
      stockItemId: stk.id,
      stockItemName: stk.name,
      locationId: toLocId,
      locationName: toLoc.name,
      quantityDelta: quantity,
      baseUnit: stk.baseUnit,
      movementType: 'TRANSFER_IN',
      sourceType: 'TRANSFER',
      sourceId: transferId,
      reasonCode: reason,
      occurredAt: now,
      actorUserId: currentUser.id,
      actorName: currentUser.name,
      unitCostSnapshot: stk.averageUnitCost,
      totalCostValuation: costVal
    };

    setStockMovements(prev => [outMvt, inMvt, ...prev]);

    setStockItems(prev =>
      prev.map(s => {
        if (s.id === stockItemId) {
          const fromCurrent = s.currentStock[fromLocId] || 0;
          const toCurrent = s.currentStock[toLocId] || 0;
          return {
            ...s,
            currentStock: {
              ...s.currentStock,
              [fromLocId]: Math.max(0, fromCurrent - quantity),
              [toLocId]: toCurrent + quantity
            }
          };
        }
        return s;
      })
    );
  };

  const declareWaste = (
    stockItemId: string,
    locationId: string,
    quantity: number,
    reason: string
  ) => {
    const stk = stockItems.find(s => s.id === stockItemId);
    const loc = stockLocations.find(l => l.id === locationId);
    if (!stk || !loc) return;

    const now = new Date().toISOString();
    const costVal = Math.round(quantity * stk.averageUnitCost * 100) / 100;
    const wasteEventId = `WST-${Math.floor(1000 + Math.random() * 9000)}`;

    const mvt: StockMovement = {
      id: `mvt-${Date.now()}-wst`,
      organizationId: organization.id,
      propertyId: currentProperty.id,
      stockItemId: stk.id,
      stockItemName: stk.name,
      locationId: loc.id,
      locationName: loc.name,
      quantityDelta: -quantity,
      baseUnit: stk.baseUnit,
      movementType: 'WASTE',
      sourceType: 'WASTE_EVENT',
      sourceId: wasteEventId,
      reasonCode: reason,
      occurredAt: now,
      actorUserId: currentUser.id,
      actorName: currentUser.name,
      unitCostSnapshot: stk.averageUnitCost,
      totalCostValuation: costVal
    };

    setStockMovements(prev => [mvt, ...prev]);

    setStockItems(prev =>
      prev.map(s => {
        if (s.id === stockItemId) {
          const curr = s.currentStock[locationId] || 0;
          return {
            ...s,
            currentStock: {
              ...s.currentStock,
              [locationId]: Math.max(0, curr - quantity)
            }
          };
        }
        return s;
      })
    );

    // Double-entry posting: Dr. Waste Expense (5050), Cr. Inventory Asset (1200)
    const je: JournalEntry = {
      id: `je-wst-${Date.now()}`,
      entryNumber: `JE-WST-${Math.floor(10000 + Math.random() * 90000)}`,
      propertyId: currentProperty.id,
      occurredAt: now,
      postedAt: now,
      sourceType: 'WASTE',
      sourceId: wasteEventId,
      memo: `Waste declaration for ${quantity} ${stk.baseUnit} of ${stk.name} (${reason})`,
      totalDebit: costVal,
      totalCredit: costVal,
      balanced: true,
      lines: [
        {
          id: `jl-${Date.now()}-w1`,
          accountId: 'acc-5050',
          accountCode: '5050',
          accountName: 'Waste & Spillage Loss',
          debit: costVal,
          credit: 0,
          description: `Waste loss: ${reason}`
        },
        {
          id: `jl-${Date.now()}-w2`,
          accountId: 'acc-1200',
          accountCode: '1200',
          accountName: 'Inventory Asset (F&B Stock)',
          debit: 0,
          credit: costVal,
          description: `Inventory write-down`
        }
      ]
    };
    setJournalEntries(prev => [je, ...prev]);
  };

  const recordStockCountAdjustment = (
    stockItemId: string,
    locationId: string,
    countedQty: number,
    notes: string
  ) => {
    const stk = stockItems.find(s => s.id === stockItemId);
    const loc = stockLocations.find(l => l.id === locationId);
    if (!stk || !loc) return;

    const currentQty = stk.currentStock[locationId] || 0;
    const diff = countedQty - currentQty;
    if (diff === 0) return;

    const now = new Date().toISOString();
    const costVal = Math.round(Math.abs(diff) * stk.averageUnitCost * 100) / 100;
    const countId = `CNT-${Math.floor(1000 + Math.random() * 9000)}`;

    const mvt: StockMovement = {
      id: `mvt-${Date.now()}-cnt`,
      organizationId: organization.id,
      propertyId: currentProperty.id,
      stockItemId: stk.id,
      stockItemName: stk.name,
      locationId: loc.id,
      locationName: loc.name,
      quantityDelta: diff,
      baseUnit: stk.baseUnit,
      movementType: 'COUNT_ADJUSTMENT',
      sourceType: 'STOCKTAKE',
      sourceId: countId,
      reasonCode: notes || 'Physical Stocktake Count Variance',
      occurredAt: now,
      actorUserId: currentUser.id,
      actorName: currentUser.name,
      unitCostSnapshot: stk.averageUnitCost,
      totalCostValuation: costVal
    };

    setStockMovements(prev => [mvt, ...prev]);

    setStockItems(prev =>
      prev.map(s => {
        if (s.id === stockItemId) {
          return {
            ...s,
            currentStock: {
              ...s.currentStock,
              [locationId]: countedQty
            }
          };
        }
        return s;
      })
    );
  };

  // Hotel PMS Actions
  const updateRoomStatus = (roomId: string, status: HotelRoom['status']) => {
    setHotelRooms(prev =>
      prev.map(r => (r.id === roomId ? { ...r, status } : r))
    );
  };

  const postMinibarConsumption = (
    roomId: string,
    itemsConsumed: { stockItemId: string; qty: number }[]
  ) => {
    const room = hotelRooms.find(r => r.id === roomId);
    if (!room || !room.currentGuestStayId) return;

    const stay = guestStays.find(s => s.id === room.currentGuestStayId);
    if (!stay) return;

    let totalCharge = 0;
    const descriptionParts: string[] = [];

    itemsConsumed.forEach(cons => {
      const mbItem = room.minibarItems.find(m => m.stockItemId === cons.stockItemId);
      if (mbItem && cons.qty > 0) {
        const itemCharge = mbItem.price * cons.qty;
        totalCharge += itemCharge;
        descriptionParts.push(`${cons.qty}x ${mbItem.name}`);

        // Deplete stock
        const stk = stockItems.find(s => s.id === cons.stockItemId);
        if (stk) {
          const mvt: StockMovement = {
            id: `mvt-${Date.now()}-mb`,
            organizationId: organization.id,
            propertyId: currentProperty.id,
            stockItemId: stk.id,
            stockItemName: stk.name,
            locationId: 'loc-minibar-depot',
            locationName: `Room ${room.roomNumber} Minibar`,
            quantityDelta: -cons.qty,
            baseUnit: stk.baseUnit,
            movementType: 'SALE_CONSUMPTION',
            sourceType: 'MINIBAR',
            sourceId: `MB-${room.roomNumber}`,
            reasonCode: 'Guest Minibar Consumption',
            occurredAt: new Date().toISOString(),
            actorUserId: currentUser.id,
            actorName: currentUser.name,
            unitCostSnapshot: stk.averageUnitCost,
            totalCostValuation: Math.round(cons.qty * stk.averageUnitCost * 100) / 100
          };
          setStockMovements(prev => [mvt, ...prev]);
        }
      }
    });

    if (totalCharge === 0) return;

    // Post to Folio
    const entry: FolioEntry = {
      id: `fe-${Date.now()}`,
      folioId: stay.folioId,
      occurredAt: new Date().toISOString(),
      type: 'CHARGE',
      category: 'MINIBAR',
      description: `Minibar Consumption (${descriptionParts.join(', ')})`,
      amount: totalCharge,
      postedBy: `Housekeeping / ${currentUser.name}`
    };

    setGuestFolios(prev =>
      prev.map(f => {
        if (f.id === stay.folioId) {
          return {
            ...f,
            entries: [entry, ...f.entries],
            totalCharges: f.totalCharges + totalCharge,
            balanceDue: f.balanceDue + totalCharge
          };
        }
        return f;
      })
    );
  };

  const settleGuestFolio = (folioId: string, tenderType: 'CASH' | 'MPESA' | 'CARD') => {
    const folio = guestFolios.find(f => f.id === folioId);
    if (!folio || folio.balanceDue <= 0) return;

    const amount = folio.balanceDue;
    const refNum = `${tenderType}-${Math.floor(10000 + Math.random() * 90000)}`;

    const entry: FolioEntry = {
      id: `fe-${Date.now()}`,
      folioId: folio.id,
      occurredAt: new Date().toISOString(),
      type: 'PAYMENT',
      category: 'PAYMENT',
      description: `Folio Settlement at Checkout via ${tenderType} (${refNum})`,
      amount: -amount,
      postedBy: currentUser.name
    };

    setGuestFolios(prev =>
      prev.map(f => {
        if (f.id === folioId) {
          return {
            ...f,
            entries: [entry, ...f.entries],
            totalPayments: f.totalPayments + amount,
            balanceDue: 0,
            isClosed: true
          };
        }
        return f;
      })
    );

    // Update guest stay status
    setGuestStays(prev =>
      prev.map(s => (s.folioId === folioId ? { ...s, status: 'CHECKED_OUT' } : s))
    );

    // Update room status to DIRTY
    const stay = guestStays.find(s => s.folioId === folioId);
    if (stay) {
      setHotelRooms(prev =>
        prev.map(r =>
          r.roomNumber === stay.roomNumber
            ? { ...r, status: 'DIRTY', currentGuestStayId: undefined, currentGuestName: undefined }
            : r
        )
      );
    }
  };

  // Procurement Actions
  const createPurchaseOrder = (
    supplierId: string,
    items: { stockItemId: string; quantity: number; unitPrice: number }[]
  ) => {
    const sup = suppliers.find(s => s.id === supplierId);
    if (!sup) return;

    const poItems = items.map(it => {
      const stk = stockItems.find(s => s.id === it.stockItemId);
      return {
        stockItemId: it.stockItemId,
        stockItemName: stk?.name || 'Item',
        quantityOrdered: it.quantity,
        unitPrice: it.unitPrice,
        unitSymbol: stk?.baseUnit || 'unit',
        lineTotal: it.quantity * it.unitPrice
      };
    });

    const subtotal = poItems.reduce((acc, i) => acc + i.lineTotal, 0);
    const taxTotal = Math.round(subtotal * 0.16 * 100) / 100;
    const grandTotal = subtotal + taxTotal;

    const po: PurchaseOrder = {
      id: `po-${Date.now()}`,
      poNumber: `PO-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      supplierId: sup.id,
      supplierName: sup.name,
      propertyId: currentProperty.id,
      createdAt: new Date().toISOString(),
      status: 'APPROVED',
      approvedBy: currentUser.name,
      subtotal,
      taxTotal,
      grandTotal,
      items: poItems
    };

    setPurchaseOrders(prev => [po, ...prev]);
  };

  const receivePurchaseOrder = (poId: string, receivedNotes = 'Goods verified and received in good condition') => {
    const po = purchaseOrders.find(p => p.id === poId);
    if (!po) return;

    const grnNumber = `GRN-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date().toISOString();
    const updatedItems = po.items.map(it => ({
      ...it,
      quantityReceived: it.quantityOrdered,
      quantityRejected: 0
    }));

    // Add stock movements into Central Warehouse
    const movements: StockMovement[] = [];
    updatedItems.forEach(it => {
      const stk = stockItems.find(s => s.id === it.stockItemId);
      if (stk) {
        movements.push({
          id: `mvt-${Date.now()}-${it.stockItemId}`,
          organizationId: organization.id,
          propertyId: currentProperty.id,
          stockItemId: stk.id,
          stockItemName: stk.name,
          locationId: 'loc-warehouse',
          locationName: 'Central Warehouse Depot',
          quantityDelta: it.quantityOrdered,
          baseUnit: it.unitSymbol,
          movementType: 'PURCHASE_RECEIPT',
          sourceType: 'PURCHASE',
          sourceId: po.poNumber,
          reasonCode: `Received via ${grnNumber} (${receivedNotes})`,
          occurredAt: now,
          actorUserId: currentUser.id,
          actorName: currentUser.name,
          unitCostSnapshot: it.unitPrice,
          totalCostValuation: it.lineTotal
        });
      }
    });

    setStockMovements(prev => [...movements, ...prev]);

    // Update stock levels
    setStockItems(prev =>
      prev.map(s => {
        const itemMove = movements.find(m => m.stockItemId === s.id);
        if (itemMove) {
          const curr = s.currentStock['loc-warehouse'] || 0;
          return {
            ...s,
            currentStock: {
              ...s.currentStock,
              'loc-warehouse': curr + itemMove.quantityDelta
            }
          };
        }
        return s;
      })
    );

    // Update PO status
    setPurchaseOrders(prev =>
      prev.map(p =>
        p.id === poId
          ? {
              ...p,
              status: 'RECEIVED',
              grnNumber,
              supplierInvoiceNumber: `INV-${po.supplierName.substring(0, 3).toUpperCase()}-${Math.floor(10000 + Math.random() * 90000)}`,
              items: updatedItems
            }
          : p
      )
    );

    // Post to General Ledger: Dr. Inventory Asset (1200), Cr. Accounts Payable (2010)
    const je: JournalEntry = {
      id: `je-po-${Date.now()}`,
      entryNumber: `JE-AP-${Math.floor(10000 + Math.random() * 90000)}`,
      propertyId: currentProperty.id,
      occurredAt: now,
      postedAt: now,
      sourceType: 'PURCHASE',
      sourceId: po.poNumber,
      memo: `Goods receipt ${grnNumber} from ${po.supplierName}`,
      totalDebit: po.grandTotal,
      totalCredit: po.grandTotal,
      balanced: true,
      lines: [
        {
          id: `jl-${Date.now()}-po1`,
          accountId: 'acc-1200',
          accountCode: '1200',
          accountName: 'Inventory Asset (F&B Stock)',
          debit: po.grandTotal,
          credit: 0,
          description: `Inventory receipt from ${po.supplierName}`
        },
        {
          id: `jl-${Date.now()}-po2`,
          accountId: 'acc-2010',
          accountCode: '2010',
          accountName: 'Accounts Payable (Trade Suppliers)',
          debit: 0,
          credit: po.grandTotal,
          description: `Supplier invoice payable to ${po.supplierName}`
        }
      ]
    };
    setJournalEntries(prev => [je, ...prev]);
  };

  // Control Engine Alerts & Approvals
  const acknowledgeAlert = (alertId: string, note?: string) => {
    setAnomalyAlerts(prev =>
      prev.map(a => (a.id === alertId ? { ...a, status: 'ACKNOWLEDGED', resolverNote: note } : a))
    );
  };

  const resolveAlert = (alertId: string, resolutionNote: string) => {
    setAnomalyAlerts(prev =>
      prev.map(a =>
        a.id === alertId
          ? {
              ...a,
              status: 'RESOLVED',
              resolvedAt: new Date().toISOString(),
              resolverNote: resolutionNote
            }
          : a
      )
    );
  };

  const handleApproval = (requestId: string, approved: boolean, reason = '') => {
    setApprovalRequests(prev =>
      prev.map(r =>
        r.id === requestId
          ? {
              ...r,
              status: approved ? 'APPROVED' : 'REJECTED',
              reviewedBy: currentUser.name,
              reviewedAt: new Date().toISOString(),
              reviewReason: reason
            }
          : r
      )
    );
  };

  // Offline Mode & Edge
  const toggleOfflineMode = () => {
    setIsOffline(prev => !prev);
  };

  const syncOfflineQueue = () => {
    if (offlineQueue.length === 0) return;
    // Process each queued offline sale
    offlineQueue.forEach(order => {
      depleteInventoryForOrder(order);
      postOrderToGeneralLedger(order, 'CASH', []);
      generateEtimsFiscalInvoice(order);
    });
    setOrders(prev => [...offlineQueue, ...prev]);
    setOfflineQueue([]);
  };

  const triggerEdgePrint = (documentType: 'RECEIPT' | 'KITCHEN_TICKET', payload: any) => {
    const timestamp = new Date().toLocaleTimeString();
    setLastEdgeEvent(`[Edge LAN Agent] Printed ${documentType} at ${timestamp}: ${JSON.stringify(payload).slice(0, 70)}...`);
  };

  const triggerCashDrawerKick = () => {
    const timestamp = new Date().toLocaleTimeString();
    setLastEdgeEvent(`[Edge LAN Agent] 24V Solenoid Cash Drawer pulse emitted at ${timestamp}`);
  };

  // North Star Traceability Evidence Search ("Where did this shilling, bottle, or variance come from?")
  const traceEvidence = (query: string) => {
    const q = query.trim().toLowerCase();
    if (!q) return { type: 'NONE' as const };

    // 1. Search Orders
    const orderMatch = orders.find(
      o => o.orderNumber.toLowerCase().includes(q) || o.id.toLowerCase().includes(q)
    );
    if (orderMatch) {
      const orderMvts = stockMovements.filter(m => m.sourceId === orderMatch.orderNumber);
      const je = journalEntries.find(j => j.sourceId === orderMatch.orderNumber);
      const fiscal = etimsInvoices.find(f => f.orderId === orderMatch.id);
      const payment = payments.find(p => p.orderId === orderMatch.id);
      return {
        type: 'ORDER' as const,
        order: orderMatch,
        movements: orderMvts,
        journalEntry: je,
        fiscalInvoice: fiscal,
        payment
      };
    }

    // 2. Search Stock Item
    const stockMatch = stockItems.find(
      s => s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q)
    );
    if (stockMatch) {
      const movements = stockMovements.filter(m => m.stockItemId === stockMatch.id);
      return {
        type: 'STOCK' as const,
        stockItem: stockMatch,
        movements
      };
    }

    // 3. Search Folio
    const folioMatch = guestFolios.find(
      f =>
        f.id.toLowerCase().includes(q) ||
        f.guestName.toLowerCase().includes(q) ||
        f.roomNumber.toLowerCase().includes(q)
    );
    if (folioMatch) {
      return {
        type: 'FOLIO' as const,
        folio: folioMatch
      };
    }

    // 4. Search Journal Entry
    const jeMatch = journalEntries.find(
      j =>
        j.entryNumber.toLowerCase().includes(q) ||
        j.memo.toLowerCase().includes(q) ||
        j.lines.some(l => l.accountCode.includes(q) || l.accountName.toLowerCase().includes(q))
    );
    if (jeMatch) {
      return {
        type: 'JOURNAL' as const,
        journalEntry: jeMatch
      };
    }

    return { type: 'NONE' as const };
  };

  return (
    <ServOSContext.Provider
      value={{
        organization,
        currentProperty,
        outlets,
        currentOutlet,
        setCurrentOutlet,
        terminals,
        currentTerminal,
        currentUser,
        setCurrentUser,
        employees,
        stockItems,
        stockLocations,
        stockMovements,
        products,
        transferStock,
        declareWaste,
        recordStockCountAdjustment,
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
        transferOrderToTable,
        processPayment,
        tillSession,
        openTillSession,
        closeTillSession,
        recordCashPaidInOut,
        accounts,
        journalEntries,
        etimsInvoices,
        hotelRooms,
        guestStays,
        guestFolios,
        updateRoomStatus,
        postMinibarConsumption,
        settleGuestFolio,
        suppliers,
        purchaseOrders,
        receivePurchaseOrder,
        createPurchaseOrder,
        anomalyAlerts,
        approvalRequests,
        acknowledgeAlert,
        resolveAlert,
        handleApproval,
        isOffline,
        toggleOfflineMode,
        offlineQueueCount: offlineQueue.length,
        syncOfflineQueue,
        edgeDevices,
        triggerEdgePrint,
        triggerCashDrawerKick,
        lastEdgeEvent,
        traceEvidence
      }}
    >
      {children}
    </ServOSContext.Provider>
  );
};

export const useServOS = () => {
  const context = useContext(ServOSContext);
  if (!context) {
    throw new Error('useServOS must be used within a ServOSProvider');
  }
  return context;
};
