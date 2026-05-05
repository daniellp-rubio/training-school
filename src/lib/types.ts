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
  password: string;
  avatar?: string;
  active: boolean;
};

export type SaleItem = {
  productId: string;
  name: string;
  qty: number;
  unitPrice: number;
};

export type PaymentMethod = "efectivo" | "tarjeta" | "nequi" | "daviplata";

export type Sale = {
  id: string;
  date: string;
  items: SaleItem[];
  total: number;
  cashierId: string;
  cashierName: string;
  paymentMethod: PaymentMethod;
  customerName?: string;
};

export type ChatMessage = { role: "user" | "assistant"; content: string };

export type ChatProductSlim = {
  name: string;
  brand: string;
  category: string;
  price: number;
  cost: number;
  stock: number;
  minStock: number;
};

export type ChatSaleSlim = {
  date: string;
  total: number;
  items: Pick<SaleItem, "name" | "qty" | "unitPrice">[];
};

export type ChatRequest = {
  messages: ChatMessage[];
  products: ChatProductSlim[];
  sales: ChatSaleSlim[];
};

export type ChatResponse =
  | { ok: true; reply: string; fallback?: false }
  | { ok: false; reply: string; fallback: true }
  | { ok: false; error: string };
