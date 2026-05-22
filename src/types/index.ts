// ─── Enums ────────────────────────────────────────────────────
export type Role = 'ADMIN' | 'SELLER';
export type MetalType = 'GOLD' | 'SILVER' | 'MIXED';
export type PricingType = 'BY_GRAM' | 'FIXED';
export type SaleSource = 'FACEBOOK' | 'WHATSAPP' | 'TIKTOK' | 'INSTAGRAM' | 'WEBSITE' | 'OTHER';
export type SaleStatus = 'PENDING_SHIPMENT' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
export type SalePriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type DiscountType = 'RETAIL' | 'WHOLESALE_CLIENT' | 'WHOLESALE_NON_CLIENT' | 'CUSTOM';

// ─── Auth ─────────────────────────────────────────────────────
export interface AuthUser {
  userId: string;
  email: string;
  name: string;
  role: Role;
}

export interface LoginResponse {
  token: string;
  user: { id: string; email: string; name: string; role: Role };
}

// ─── Metal Prices ─────────────────────────────────────────────
export interface MetalPriceData {
  spotPricePerGram: number;
  recordedAt: string;
  isManualOverride: boolean;
  source: string;
}

export interface MetalPrices {
  gold: MetalPriceData;
  silver: MetalPriceData;
  lastUpdated: string;
}

// ─── Client ───────────────────────────────────────────────────
export interface Address {
  id: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

export interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  birthday?: string;
  isWholesaleMember: boolean;
  notes?: string;
  addresses: Address[];
  createdAt: string;
}

export interface ClientHistory {
  totalPurchases: number;
  totalSpent: number;
  averageOrderValue: number;
  favoriteProduct: string | null;
  lastPurchase: string | null;
  purchases: {
    saleNumber: string;
    total: number;
    status: SaleStatus;
    itemCount: number;
    createdAt: string;
    seller: string;
  }[];
}

// ─── Supplier ─────────────────────────────────────────────────
export interface Supplier {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  notes?: string;
  isActive: boolean;
  _count?: { products: number };
}

// ─── Product ──────────────────────────────────────────────────
export interface Product {
  id: string;
  name: string;
  description?: string;
  metalType: MetalType;
  pricingType: PricingType;
  baseGramMarkup?: number;
  fixedPrice?: number;
  imageUrl?: string;
  isActive: boolean;
  supplierId?: string;
  supplier?: Supplier;
}

// ─── Wholesale Range ──────────────────────────────────────────
export interface WholesaleRange {
  id: string;
  metalType: MetalType;
  minAmount: number;
  maxAmount?: number;
  markupPerGram: number;
  label?: string;
  isActive: boolean;
}

// ─── Sale ─────────────────────────────────────────────────────
export interface SaleItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  weightGrams: number;
  unitPrice: number;
  totalPrice: number;
  spotPriceUsed: number;
  baseGramMarkupUsed: number;
  wholesaleMarkupUsed: number;
  extraMarkupUsed: number;
  finalPricePerGram: number;
}

export interface Sale {
  id: string;
  saleNumber: string;
  client: Client;
  seller: { id: string; name: string };
  metalType: MetalType;
  source: SaleSource;
  status: SaleStatus;
  priority: SalePriority;
  discountType: DiscountType;
  extraMarkupPerGram: number;
  trackingNumber?: string;
  goldPriceUsed?: number;
  silverPriceUsed?: number;
  subtotal: number;
  totalDiscount: number;
  total: number;
  notes?: string;
  items: SaleItem[];
  createdAt: string;
}

// ─── Sale Creation ────────────────────────────────────────────
export interface SaleItemInput {
  productId: string;
  quantity: number;
  weightGrams: number;
  _product?: Product; // local UI only
}

export interface CreateSaleInput {
  clientId: string;
  shippingAddressId?: string;
  metalType: MetalType;
  source: SaleSource;
  priority: SalePriority;
  discountType: DiscountType;
  extraMarkupPerGram: number;
  items: SaleItemInput[];
  notes?: string;
}

export interface SaleItemCalc {
  productId: string;
  productName: string;
  quantity: number;
  weightGrams: number;
  spotPriceUsed: number;
  baseGramMarkupUsed: number;
  wholesaleMarkupUsed: number;
  extraMarkupUsed: number;
  finalPricePerGram: number;
  unitPrice: number;
  totalPrice: number;
}

export interface SalePreview {
  items: SaleItemCalc[];
  goldPriceUsed: number;
  silverPriceUsed: number;
  subtotal: number;
  totalDiscount: number;
  total: number;
  discountType: DiscountType;
  wholesaleRangeApplied?: string;
}

// ─── Dashboard ────────────────────────────────────────────────
export interface DashboardStats {
  todaySales: number;
  todayRevenue: number;
  pendingShipments: number;
  thisMonthRevenue: number;
  salesBySource: { source: SaleSource; count: number; total: number }[];
  salesByStatus: { status: SaleStatus; count: number }[];
  recentSales: {
    id: string;
    saleNumber: string;
    clientName: string;
    total: number;
    status: SaleStatus;
    source: SaleSource;
    createdAt: string;
  }[];
}

// ─── API ──────────────────────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
