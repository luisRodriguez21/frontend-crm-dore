import api from './client';
import type {
  LoginResponse, MetalPrices, Client, ClientHistory, Supplier,
  Product, WholesaleRange, Sale, CreateSaleInput, SalePreview,
  DashboardStats, MetalType, PaginatedResponse, ApiResponse
} from '../types';

// ─── Auth ─────────────────────────────────────────────────────
export const authApi = {
  login: (email: string, password: string) =>
    api.post<ApiResponse<LoginResponse>>('/auth/login', { email, password }),
  me: () => api.get<ApiResponse<{ userId: string; email: string; name: string; role: string }>>('/auth/me'),
  register: (data: { email: string; name: string; password: string; role?: string }) =>
    api.post('/auth/register', data),
  changePassword: (currentPassword: string, newPassword: string) =>
    api.patch('/auth/change-password', { currentPassword, newPassword }),
};

// ─── Metal Prices ─────────────────────────────────────────────
export const metalPriceApi = {
  getCurrent: () => api.get<ApiResponse<MetalPrices>>('/metal-prices/current'),
  getHistory: (metalType: MetalType, days?: number) =>
    api.get('/metal-prices/history', { params: { metalType, days } }),
  setOverride: (data: { metalType: MetalType; spotPricePerGram: number; note?: string }) =>
    api.post('/metal-prices/override', data),
};

// ─── Sales ────────────────────────────────────────────────────
export const salesApi = {
  list: (params?: Record<string, unknown>) =>
    api.get<PaginatedResponse<Sale>>('/sales', { params }),
  getOne: (id: string) =>
    api.get<ApiResponse<Sale>>(`/sales/${id}`),
  preview: (data: CreateSaleInput) =>
    api.post<ApiResponse<SalePreview>>('/sales/preview', data),
  create: (data: CreateSaleInput) =>
    api.post<ApiResponse<{ sale: Sale; calculation: SalePreview }>>('/sales', data),
  update: (id: string, data: Partial<{ status: string; trackingNumber: string; notes: string }>) =>
    api.patch<ApiResponse<Sale>>(`/sales/${id}`, data),
  dashboard: () =>
    api.get<ApiResponse<DashboardStats>>('/sales/dashboard'),
};

// ─── Clients ──────────────────────────────────────────────────
export const clientsApi = {
  list: (params?: Record<string, unknown>) =>
    api.get<PaginatedResponse<Client>>('/clients', { params }),
  getOne: (id: string) =>
    api.get<ApiResponse<Client>>(`/clients/${id}`),
  history: (id: string) =>
    api.get<ApiResponse<ClientHistory>>(`/clients/${id}/history`),
  create: (data: Partial<Client> & { address?: object }) =>
    api.post<ApiResponse<Client>>('/clients', data),
  update: (id: string, data: Partial<Client>) =>
    api.put<ApiResponse<Client>>(`/clients/${id}`, data),
  delete: (id: string) =>
    api.delete(`/clients/${id}`),
  addAddress: (id: string, data: object) =>
    api.post(`/clients/${id}/addresses`, data),
};

// ─── Products ─────────────────────────────────────────────────
export const productsApi = {
  list: (params?: Record<string, unknown>) =>
    api.get<PaginatedResponse<Product>>('/products', { params }),
  getOne: (id: string) =>
    api.get<ApiResponse<Product>>(`/products/${id}`),
  create: (data: Partial<Product>) =>
    api.post<ApiResponse<Product>>('/products', data),
  update: (id: string, data: Partial<Product>) =>
    api.put<ApiResponse<Product>>(`/products/${id}`, data),
  delete: (id: string) =>
    api.delete(`/products/${id}`),
};

// ─── Suppliers ────────────────────────────────────────────────
export const suppliersApi = {
  list: (params?: Record<string, unknown>) =>
    api.get<PaginatedResponse<Supplier>>('/suppliers', { params }),
  getOne: (id: string) =>
    api.get<ApiResponse<Supplier>>(`/suppliers/${id}`),
  create: (data: Partial<Supplier>) =>
    api.post<ApiResponse<Supplier>>('/suppliers', data),
  update: (id: string, data: Partial<Supplier>) =>
    api.put<ApiResponse<Supplier>>(`/suppliers/${id}`, data),
  delete: (id: string) =>
    api.delete(`/suppliers/${id}`),
};

// ─── Wholesale Ranges ─────────────────────────────────────────
export const wholesaleApi = {
  list: (metalType?: MetalType) =>
    api.get<ApiResponse<WholesaleRange[]>>('/wholesale-ranges', { params: { metalType } }),
  create: (data: Partial<WholesaleRange>) =>
    api.post<ApiResponse<WholesaleRange>>('/wholesale-ranges', data),
  update: (id: string, data: Partial<WholesaleRange>) =>
    api.put<ApiResponse<WholesaleRange>>(`/wholesale-ranges/${id}`, data),
  delete: (id: string) =>
    api.delete(`/wholesale-ranges/${id}`),
};
