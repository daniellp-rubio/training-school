export type Category = "suplementos" | "tecnologia" | "accesorios";

export type Product = {
  id: string;
  sku: string;
  name: string;
  brand: string;
  category: Category;
  price: number;
  cost: number;
  stock: number;
  minStock: number;
  image?: string;
  description?: string;
};

export type Role = "admin" | "cajero" | "entrenador";

export type User = {
  id: string;
  name: string;
  role: Role;
  email: string;
  avatar?: string;
  active: boolean;
};

export type SaleItem = {
  productId: string;
  name: string;
  qty: number;
  unitPrice: number;
};

export type Sale = {
  id: string;
  date: string;
  items: SaleItem[];
  total: number;
  cashierId: string;
  cashierName: string;
  paymentMethod: "efectivo" | "tarjeta" | "nequi" | "daviplata";
  customerName?: string;
};
