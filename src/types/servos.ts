/**
 * ServOS - Hospitality Operating System
 * Domain Types Specification (Baseline v1.0)
 */

// Tenancy & Organization Hierarchy
export interface Organization {
  id: string;
  name: string;
  code: string;
  baseCurrency: string;
}

export interface Property {
  id: string;
  organizationId: string;
  name: string;
  code: string;
  currency: string;
  timezone: string;
  kraPin: string;
  etimsCuNumber: string;
}

export interface Outlet {
  id: string;
  propertyId: string;
  name: string;
  type: 'BAR' | 'RESTAURANT' | 'HOTEL_FRONT' | 'POOL_LOUNGE' | 'EVENT_HALL';
  defaultStockLocationId: string;
  active: boolean;
}

export interface Terminal {
  id: string;
  propertyId: string;
  outletId: string;
  name: string;
  hardwareSerial: string;
  isEdgeConnected: boolean;
  assignedCashierId?: string;
  currentTillSessionId?: string;
}

// Measurement & Catalog
export type UnitDimension = 'COUNT' | 'VOLUME' | 'MASS' | 'TIME' | 'CAPACITY' | 'CURRENCY';

export interface MeasurementUnit {
  id: string;
  name: string;
  symbol: string;
  dimension: UnitDimension;
  isBase: boolean;
  baseUnitId?: string;
  conversionFactor: number; // e.g., 1 bottle = 750 ml -> factor = 750
}

export type ProductType =
  | 'STOCK_ITEM'
  | 'PORTION'
  | 'RECIPE'
  | 'PACKAGE'
  | 'SERVICE'
  | 'ROOM'
  | 'TICKET'
  | 'OPEN_PRICE';

export type ConsumptionMethod =
  | 'UNIT'
  | 'MEASURED'
  | 'RECIPE'
  | 'SESSION'
  | 'TIME'
  | 'CAPACITY'
  | 'NONE';

export interface RecipeIngredient {
  stockItemId: string;
  quantity: number; // in stockItem base unit (e.g., 30 for 30ml)
  unitSymbol: string;
  tracked: boolean;
}

export interface RecipeModifier {
  id: string;
  name: string;
  priceDelta: number;
  ingredientAdjustments: {
    stockItemId: string;
    quantityDelta: number; // e.g., +30 for extra gin, -0.5 for no lime
  }[];
}

export interface ProductSellable {
  id: string;
  code: string;
  name: string;
  category: 'SPIRITS' | 'BEER' | 'WINE' | 'COCKTAIL' | 'FOOD' | 'PACKAGE' | 'ROOM' | 'EXPERIENCE';
  productType: ProductType;
  consumptionMethod: ConsumptionMethod;
  price: number; // In base currency KES
  taxClassId: 'A_16' | 'B_0' | 'C_EXEMPT';
  outletIds: string[];
  stockItemId?: string;
  portionVolume?: number; // e.g. 30 for shot, 60 for double, 750 for bottle
  portionUnitSymbol?: string;
  recipeIngredients?: RecipeIngredient[];
  modifiers?: RecipeModifier[];
  packageMixersCount?: number;
  available: boolean;
  routeTo: 'BAR' | 'KITCHEN' | 'SERVICE';
}

// Inventory & Stock Movement Ledger
export type MovementType =
  | 'PURCHASE_RECEIPT'
  | 'TRANSFER_OUT'
  | 'TRANSFER_IN'
  | 'SALE_CONSUMPTION'
  | 'PRODUCTION_INPUT'
  | 'PRODUCTION_OUTPUT'
  | 'WASTE'
  | 'COMP_CONSUMPTION'
  | 'COUNT_ADJUSTMENT'
  | 'RETURN_TO_SUPPLIER';

export interface StockLocation {
  id: string;
  propertyId: string;
  name: string;
  type: 'WAREHOUSE' | 'BAR_STORE' | 'KITCHEN_STORE' | 'MINIBAR' | 'STATION';
}

export interface StockItem {
  id: string;
  code: string;
  name: string;
  dimension: UnitDimension;
  baseUnit: string; // 'ml', 'g', 'unit'
  parLevel: number;
  reorderPoint: number;
  currentStock: Record<string, number>; // locationId -> current quantity in base unit
  averageUnitCost: number; // KES per base unit
  category: string;
}

export interface StockMovement {
  id: string;
  organizationId: string;
  propertyId: string;
  stockItemId: string;
  stockItemName: string;
  locationId: string;
  locationName: string;
  quantityDelta: number; // Positive or negative in base unit
  baseUnit: string;
  movementType: MovementType;
  sourceType?: 'ORDER' | 'TRANSFER' | 'PURCHASE' | 'WASTE_EVENT' | 'STOCKTAKE' | 'MINIBAR';
  sourceId?: string;
  reasonCode?: string;
  occurredAt: string;
  actorUserId: string;
  actorName: string;
  unitCostSnapshot: number;
  totalCostValuation: number;
}

// Table & Order Domain
export type TableState = 'AVAILABLE' | 'SEATED' | 'ORDERING' | 'SERVED' | 'PAYMENT_DUE' | 'CLEANING';
export type OrderState = 'DRAFT' | 'OPEN' | 'SENT' | 'PARTIALLY_SERVED' | 'COMPLETED' | 'VOIDED';
export type OrderItemState = 'OPEN' | 'ROUTED' | 'PREPARING' | 'READY' | 'SERVED' | 'VOIDED';

export interface RestaurantTable {
  id: string;
  propertyId: string;
  outletId: string;
  label: string;
  capacity: number;
  section: 'VIP_LOUNGE' | 'MAIN_DECK' | 'TERRACE' | 'GRILL_ROOM';
  state: TableState;
  currentOrderId?: string;
  minimumSpend?: number; // e.g. KES 50,000 for VIP tables
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  portionName?: string;
  quantity: number;
  unitPrice: number;
  taxAmount: number;
  cateringLevy: number;
  totalPrice: number;
  modifiers: {
    modifierId: string;
    name: string;
    priceDelta: number;
  }[];
  selectedMixers?: string[];
  state: OrderItemState;
  sentAt?: string;
  kitchenNote?: string;
  isComp?: boolean;
  compReason?: string;
  compApprovedBy?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  propertyId: string;
  outletId: string;
  terminalId: string;
  tableId?: string;
  tableName?: string;
  tabName?: string;
  guestFolioId?: string; // If charged to hotel room
  serverEmployeeId: string;
  serverName: string;
  state: OrderState;
  items: OrderItem[];
  subtotal: number;
  taxTotal: number; // 16% VAT
  cateringLevyTotal: number; // 2% Catering Levy
  shortfallAdjustment: number; // Minimum spend adjustment
  discountTotal: number;
  discountReason?: string;
  grandTotal: number;
  amountPaid: number;
  createdAt: string;
  completedAt?: string;
  paymentMethod?: string;
  etimsInvoiceNumber?: string;
  etimsQrCode?: string;
  journalEntryId?: string;
  isOfflineCreated?: boolean;
}

// Payments & Cash Management
export type PaymentState = 'REQUESTED' | 'PENDING' | 'AUTHORIZED' | 'PAID' | 'FAILED' | 'REVERSED' | 'REFUNDED';
export type TenderType = 'CASH' | 'MPESA' | 'CARD' | 'ROOM_CHARGE' | 'COMPANY_CREDIT';

export interface PaymentRecord {
  id: string;
  orderId?: string;
  folioId?: string;
  propertyId: string;
  tenderType: TenderType;
  amount: number;
  currency: string;
  status: PaymentState;
  referenceNumber: string;
  providerMetadata?: {
    darajaMerchantRequestId?: string;
    darajaCheckoutRequestId?: string;
    mpesaReceipt?: string;
    phoneNumber?: string;
    cardAuthCode?: string;
    cardLast4?: string;
    guestRoomNumber?: string;
  };
  cashTendered?: number;
  changeGiven?: number;
  occurredAt: string;
  cashierId: string;
  cashierName: string;
}

export interface TillSession {
  id: string;
  terminalId: string;
  terminalName: string;
  employeeId: string;
  employeeName: string;
  openedAt: string;
  openingFloat: number;
  cashSalesTotal: number;
  cashPaidIn: number;
  cashPaidOut: number;
  expectedCashInDrawer: number;
  countedCashAtClose?: number;
  cashVariance?: number;
  closedAt?: string;
  status: 'OPEN' | 'CLOSED';
}

// Accounting Engine (Double-Entry Ledger)
export interface Account {
  id: string;
  code: string;
  name: string;
  type: 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE';
  balance: number;
}

export interface JournalLine {
  id: string;
  accountId: string;
  accountCode: string;
  accountName: string;
  debit: number;
  credit: number;
  description: string;
}

export interface JournalEntry {
  id: string;
  entryNumber: string;
  propertyId: string;
  occurredAt: string;
  postedAt: string;
  sourceType: 'SALE' | 'PURCHASE' | 'WASTE' | 'ROOM_CHARGE' | 'PAYMENT' | 'COUNT_ADJUSTMENT' | 'REFUND';
  sourceId: string;
  memo: string;
  lines: JournalLine[];
  totalDebit: number;
  totalCredit: number;
  balanced: boolean;
}

// Kenya eTIMS Fiscal Integration
export interface EtimsFiscalInvoice {
  id: string;
  orderId: string;
  invoiceNumber: string;
  cuSerialNumber: string;
  customerPin?: string;
  customerName?: string;
  taxableAmount: number;
  vatAmount: number;
  levyAmount: number;
  totalAmount: number;
  qrCodeUrl: string;
  fiscalDate: string;
  status: 'FISCALIZED' | 'PENDING' | 'FAILED';
  verificationHash: string;
}

// Hotel PMS & Folios
export interface RoomType {
  id: string;
  name: string;
  baseRate: number;
  maxGuests: number;
  features: string[];
}

export type RoomOperationalStatus =
  | 'AVAILABLE'
  | 'OCCUPIED'
  | 'DIRTY'
  | 'CLEANING'
  | 'INSPECTION'
  | 'OUT_OF_ORDER';

export interface HotelRoom {
  id: string;
  roomNumber: string;
  roomTypeId: string;
  roomTypeName: string;
  floor: number;
  status: RoomOperationalStatus;
  currentGuestStayId?: string;
  currentGuestName?: string;
  minibarItems: {
    stockItemId: string;
    name: string;
    expectedQty: number;
    currentQty: number;
    price: number;
  }[];
}

export interface GuestStay {
  id: string;
  reservationId: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  roomNumber: string;
  roomTypeId: string;
  checkInDate: string;
  checkOutDate: string;
  creditLimit: number;
  allowRoomCharge: boolean;
  status: 'RESERVED' | 'CHECKED_IN' | 'CHECKED_OUT';
  folioId: string;
}

export interface FolioEntry {
  id: string;
  folioId: string;
  occurredAt: string;
  type: 'CHARGE' | 'PAYMENT' | 'CREDIT' | 'TRANSFER';
  category: 'ROOM' | 'F&B_BAR' | 'F&B_KITCHEN' | 'MINIBAR' | 'LAUNDRY' | 'PAYMENT';
  description: string;
  amount: number; // positive for charges, negative for payments/credits
  referenceId?: string;
  postedBy: string;
}

export interface GuestFolio {
  id: string;
  stayId: string;
  guestName: string;
  roomNumber: string;
  entries: FolioEntry[];
  totalCharges: number;
  totalPayments: number;
  balanceDue: number;
  isClosed: boolean;
}

// Procurement
export interface Supplier {
  id: string;
  name: string;
  code: string;
  contactPerson: string;
  phone: string;
  email: string;
  kraPin: string;
  paymentTermsDays: number;
}

export interface PurchaseOrderItem {
  stockItemId: string;
  stockItemName: string;
  quantityOrdered: number;
  unitPrice: number;
  unitSymbol: string;
  lineTotal: number;
  quantityReceived?: number;
  quantityRejected?: number;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierId: string;
  supplierName: string;
  propertyId: string;
  createdAt: string;
  status: 'DRAFT' | 'APPROVED' | 'PARTIALLY_RECEIVED' | 'RECEIVED' | 'INVOICED';
  items: PurchaseOrderItem[];
  subtotal: number;
  taxTotal: number;
  grandTotal: number;
  approvedBy?: string;
  grnNumber?: string;
  supplierInvoiceNumber?: string;
}

// Staff & HR
export interface Employee {
  id: string;
  code: string;
  name: string;
  email: string;
  phone: string;
  role: 'WAITER' | 'BARTENDER' | 'CHEF' | 'CASHIER' | 'RECEPTIONIST' | 'HOUSEKEEPER' | 'MANAGER' | 'FINANCE';
  permissions: string[];
  activeShiftId?: string;
  hourlyRate: number;
  commissionRate: number; // e.g. 0.05 (5%)
}

// Control Engine & Anomaly Detection
export type AnomalySeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface AnomalyAlert {
  id: string;
  ruleCode:
    | 'STOCK_VARIANCE_ABOVE_TOLERANCE'
    | 'VOID_RATE_ANOMALY'
    | 'CASH_DRAWER_VARIANCE'
    | 'NEGATIVE_MARGIN_ITEM'
    | 'UNMATCHED_PAYMENT'
    | 'CREDIT_LIMIT_BREACH'
    | 'LOW_STOCK_WITH_HIGH_VELOCITY'
    | 'ROOM_MAINTENANCE_SLA_BREACH';
  title: string;
  description: string;
  severity: AnomalySeverity;
  evidence: {
    transactionId?: string;
    stockItemId?: string;
    differenceAmount?: number;
    expectedValue?: string | number;
    actualValue?: string | number;
    employeeName?: string;
    terminalName?: string;
  };
  recommendedAction: string;
  status: 'OPEN' | 'ACKNOWLEDGED' | 'RESOLVED' | 'DISMISSED';
  detectedAt: string;
  resolvedAt?: string;
  resolverNote?: string;
}

export interface ApprovalRequest {
  id: string;
  actionType: 'ORDER_VOID' | 'DISCOUNT_OVERRIDE' | 'COMP_ITEM' | 'STOCK_ADJUSTMENT' | 'REFUND';
  requestedBy: string;
  requesterName: string;
  details: string;
  amount?: number;
  targetId: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  requestedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewReason?: string;
}

// Hardware & Edge Agent
export interface EdgeDevice {
  id: string;
  name: string;
  type: 'RECEIPT_PRINTER' | 'KITCHEN_PRINTER' | 'CASH_DRAWER' | 'BARCODE_SCANNER' | 'WEIGHING_SCALE';
  connection: 'LAN' | 'USB' | 'SERIAL';
  status: 'ONLINE' | 'OFFLINE';
  lastPing: string;
}
