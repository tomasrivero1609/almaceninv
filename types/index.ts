export interface Product {
  id: string;
  name: string;
  code: string;
  unitCost: number;
  salePrice: number;
  currentStock: number;
  totalInvested: number; // total invertido en compras
}

export interface Entry {
  id: string;
  productId: string;
  productName: string;
  productCode: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  date: string;
}

export interface Sale {
  id: string;
  productId: string;
  productName: string;
  productCode: string;
  quantity: number;
  unitPrice: number;
  totalRevenue: number;
  date: string;
  transactionId?: string;
  sellerId?: string;
  sellerName?: string;
}

export interface Summary {
  totalInvested: number;
  totalSold: number;
  grossProfit: number;
}

export type UserRole = 'admin' | 'seller';

export interface SessionUser {
  id: string;
  username: string;
  role: UserRole;
}

