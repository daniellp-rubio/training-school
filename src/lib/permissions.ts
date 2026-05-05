import type { Role } from "./types";

export const PERMISSIONS = {
  admin: {
    dashboard: true,
    pos: true,
    inventario: true,
    inventarioEdit: true,
    ventas: true,
    usuarios: true,
    usuariosEdit: true,
    asesor: true,
  },
  cajero: {
    dashboard: true,
    pos: true,
    inventario: true,
    inventarioEdit: false,
    ventas: true,
    usuarios: false,
    usuariosEdit: false,
    asesor: true,
  },
  entrenador: {
    dashboard: true,
    pos: false,
    inventario: true,
    inventarioEdit: false,
    ventas: false,
    usuarios: false,
    usuariosEdit: false,
    asesor: true,
  },
} as const;

export type Permission = keyof typeof PERMISSIONS["admin"];

export const can = (role: Role, perm: Permission): boolean =>
  PERMISSIONS[role][perm];
