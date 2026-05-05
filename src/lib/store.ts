"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Product, User, Sale, Role, SaleItem } from "./types";
import { seedProducts, seedUsers, seedSales } from "./seed";

type CartLine = { productId: string; qty: number };

type LoginResult = { ok: true } | { ok: false; error: string };

type State = {
  products: Product[];
  users: User[];
  sales: Sale[];
  currentUserId: string | null;
  isAuthenticated: boolean;
  cart: CartLine[];

  login: (email: string, password: string) => LoginResult;
  logout: () => void;
  setRole: (role: Role) => void;
  setUser: (id: string) => void;

  addProduct: (p: Omit<Product, "id">) => void;
  updateProduct: (id: string, patch: Partial<Product>) => void;
  deleteProduct: (id: string) => void;

  addUser: (u: Omit<User, "id">) => void;
  updateUser: (id: string, patch: Partial<User>) => void;
  deleteUser: (id: string) => void;

  addToCart: (productId: string, qty?: number) => void;
  setCartQty: (productId: string, qty: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  checkout: (paymentMethod: Sale["paymentMethod"], customerName?: string) => Sale | null;

  resetSeed: () => void;
};

const newId = () => Math.random().toString(36).slice(2, 10);

export const useApp = create<State>()(
  persist(
    (set, get) => ({
      products: seedProducts,
      users: seedUsers,
      sales: seedSales,
      currentUserId: null,
      isAuthenticated: false,
      cart: [],

      login: (email, password) => {
        const normalized = email.trim().toLowerCase();
        const user = get().users.find(
          (u) => u.email.toLowerCase() === normalized
        );
        if (!user) return { ok: false, error: "Correo no registrado" };
        if (!user.active)
          return { ok: false, error: "Usuario inactivo. Contacta al administrador" };
        if (user.password !== password)
          return { ok: false, error: "Contraseña incorrecta" };
        set({ currentUserId: user.id, isAuthenticated: true });
        return { ok: true };
      },
      logout: () => set({ currentUserId: null, isAuthenticated: false, cart: [] }),
      setRole: (role) => {
        const u = get().users.find((x) => x.role === role && x.active);
        if (u) set({ currentUserId: u.id });
      },
      setUser: (id) => set({ currentUserId: id }),

      addProduct: (p) =>
        set((s) => ({ products: [...s.products, { ...p, id: newId() }] })),
      updateProduct: (id, patch) =>
        set((s) => ({
          products: s.products.map((p) => (p.id === id ? { ...p, ...patch } : p)),
        })),
      deleteProduct: (id) =>
        set((s) => ({ products: s.products.filter((p) => p.id !== id) })),

      addUser: (u) =>
        set((s) => ({ users: [...s.users, { ...u, id: newId() }] })),
      updateUser: (id, patch) =>
        set((s) => ({
          users: s.users.map((u) => (u.id === id ? { ...u, ...patch } : u)),
        })),
      deleteUser: (id) =>
        set((s) => ({ users: s.users.filter((u) => u.id !== id) })),

      addToCart: (productId, qty = 1) =>
        set((s) => {
          const existing = s.cart.find((c) => c.productId === productId);
          if (existing) {
            return {
              cart: s.cart.map((c) =>
                c.productId === productId ? { ...c, qty: c.qty + qty } : c
              ),
            };
          }
          return { cart: [...s.cart, { productId, qty }] };
        }),
      setCartQty: (productId, qty) =>
        set((s) => ({
          cart:
            qty <= 0
              ? s.cart.filter((c) => c.productId !== productId)
              : s.cart.map((c) =>
                  c.productId === productId ? { ...c, qty } : c
                ),
        })),
      removeFromCart: (productId) =>
        set((s) => ({ cart: s.cart.filter((c) => c.productId !== productId) })),
      clearCart: () => set({ cart: [] }),

      checkout: (paymentMethod, customerName) => {
        const { cart, products, currentUserId, users, sales } = get();
        if (cart.length === 0) return null;
        const cashier = users.find((u) => u.id === currentUserId);
        if (!cashier) return null;

        const items: SaleItem[] = cart.map((c) => {
          const p = products.find((x) => x.id === c.productId)!;
          return { productId: c.productId, name: p.name, qty: c.qty, unitPrice: p.price };
        });
        const total = items.reduce((a, b) => a + b.qty * b.unitPrice, 0);

        const sale: Sale = {
          id: `s${newId()}`,
          date: new Date().toISOString(),
          items,
          total,
          cashierId: cashier.id,
          cashierName: cashier.name,
          paymentMethod,
          customerName,
        };

        set({
          sales: [sale, ...sales],
          cart: [],
          products: products.map((p) => {
            const line = cart.find((c) => c.productId === p.id);
            return line ? { ...p, stock: Math.max(0, p.stock - line.qty) } : p;
          }),
        });
        return sale;
      },

      resetSeed: () =>
        set({
          products: seedProducts,
          users: seedUsers,
          sales: seedSales,
          cart: [],
          currentUserId: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: "training-school-store",
      storage: createJSONStorage(() => localStorage),
      version: 2,
      migrate: (persisted: any) => {
        if (!persisted) return persisted;
        if (persisted.users) {
          persisted.users = persisted.users.map((u: any) => ({
            ...u,
            password: u.password ?? seedUsers.find((s) => s.id === u.id)?.password ?? "Coach2026*",
          }));
        }
        if (persisted.isAuthenticated === undefined) {
          persisted.isAuthenticated = false;
          persisted.currentUserId = null;
        }
        return persisted;
      },
    }
  )
);

export const useCurrentUser = () => {
  const id = useApp((s) => s.currentUserId);
  const users = useApp((s) => s.users);
  if (!id) return undefined;
  return users.find((u) => u.id === id);
};

export const formatCOP = (n: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(n);
