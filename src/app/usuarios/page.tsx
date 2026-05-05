"use client";

import { useApp, useCurrentUser } from "@/lib/store";
import { can, PERMISSIONS } from "@/lib/permissions";
import type { Role, User } from "@/lib/types";
import { useState } from "react";
import {
  Plus,
  Lock,
  Edit3,
  Trash2,
  X,
  Save,
  CheckCircle2,
  Circle,
  RotateCcw,
} from "lucide-react";
import { motion } from "framer-motion";

const roleColors: Record<Role, string> = {
  admin: "from-accent to-accent-dim",
  cajero: "from-blue-400 to-cyan-500",
  entrenador: "from-fuchsia-400 to-purple-500",
};

const roleLabel: Record<Role, string> = {
  admin: "Administrador",
  cajero: "Cajero",
  entrenador: "Entrenador",
};

const roleDescription: Record<Role, string> = {
  admin: "Control total del sistema",
  cajero: "POS, inventario lectura y ventas",
  entrenador: "Inventario lectura y asesor IA",
};

const empty: Omit<User, "id"> = {
  name: "",
  email: "",
  password: "Cambiar2026*",
  role: "cajero",
  active: true,
};

export default function UsuariosPage() {
  const me = useCurrentUser();
  const users = useApp((s) => s.users);
  const addUser = useApp((s) => s.addUser);
  const updateUser = useApp((s) => s.updateUser);
  const deleteUser = useApp((s) => s.deleteUser);
  const resetSeed = useApp((s) => s.resetSeed);

  const canEdit = me ? can(me.role, "usuariosEdit") : false;
  const canView = me ? can(me.role, "usuarios") : false;

  const [editing, setEditing] = useState<User | (Omit<User, "id"> & { id?: string }) | null>(null);

  if (!canView) {
    return (
      <div className="glass p-12 text-center">
        <Lock className="w-10 h-10 mx-auto text-ink-muted mb-3" />
        <h2 className="text-xl font-bold">Sin acceso a Usuarios</h2>
        <p className="text-sm text-ink-dim mt-2">Solo administradores.</p>
      </div>
    );
  }

  const save = () => {
    if (!editing) return;
    if ("id" in editing && editing.id) updateUser(editing.id, editing);
    else addUser(editing);
    setEditing(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-accent/80">Equipo</div>
          <h1 className="text-3xl font-bold tracking-tight mt-1">Usuarios y permisos</h1>
          <p className="text-ink-dim text-sm mt-1">
            {users.length} miembros · {users.filter((u) => u.active).length} activos
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (confirm("Esto restablece todos los datos de la demo. ¿Continuar?")) resetSeed();
            }}
            className="btn-ghost"
            title="Restablecer datos demo"
          >
            <RotateCcw className="w-4 h-4" />
            Reset demo
          </button>
          {canEdit && (
            <button onClick={() => setEditing({ ...empty })} className="btn-primary">
              <Plus className="w-4 h-4" />
              Nuevo usuario
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(Object.keys(PERMISSIONS) as Role[]).map((r, i) => (
          <motion.div
            key={r}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass p-5"
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className={`w-10 h-10 rounded-xl bg-gradient-to-br ${roleColors[r]} flex items-center justify-center text-white text-xs font-bold`}
              >
                {r[0].toUpperCase()}
              </div>
              <div>
                <div className="font-semibold">{roleLabel[r]}</div>
                <div className="text-xs text-ink-muted">{roleDescription[r]}</div>
              </div>
            </div>
            <div className="space-y-1.5 text-xs">
              {Object.entries(PERMISSIONS[r]).map(([k, v]) => (
                <div key={k} className="flex items-center gap-2">
                  {v ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-accent" />
                  ) : (
                    <Circle className="w-3.5 h-3.5 text-ink-muted/50" />
                  )}
                  <span className={v ? "text-ink" : "text-ink-muted"}>
                    {k.replace(/([A-Z])/g, " $1").toLowerCase()}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="glass overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[10px] uppercase tracking-wider text-ink-muted border-b border-border">
              <th className="px-5 py-3">Persona</th>
              <th className="px-3 py-3">Rol</th>
              <th className="px-3 py-3">Email</th>
              <th className="px-3 py-3">Estado</th>
              {canEdit && <th className="px-5 py-3" />}
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-border/60 hover:bg-white/3">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-lg bg-gradient-to-br ${roleColors[u.role]} flex items-center justify-center text-white text-xs font-bold`}
                    >
                      {u.name.split(" ").map((p) => p[0]).slice(0, 2).join("")}
                    </div>
                    <div className="font-medium">{u.name}</div>
                  </div>
                </td>
                <td className="px-3 py-3">
                  <span className="chip text-[10px] capitalize">{roleLabel[u.role]}</span>
                </td>
                <td className="px-3 py-3 text-ink-dim">{u.email}</td>
                <td className="px-3 py-3">
                  <span
                    className={`inline-flex items-center gap-1.5 text-xs ${u.active ? "text-emerald-400" : "text-ink-muted"}`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${u.active ? "bg-emerald-400" : "bg-ink-muted/50"}`}
                    />
                    {u.active ? "Activo" : "Inactivo"}
                  </span>
                </td>
                {canEdit && (
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        aria-label={`Editar usuario ${u.name}`}
                        onClick={() => setEditing({ ...u })}
                        className="p-2 rounded-lg hover:bg-white/5 text-ink-dim hover:text-ink"
                      >
                        <Edit3 aria-hidden="true" className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        aria-label={`Eliminar usuario ${u.name}`}
                        onClick={() => {
                          if (confirm(`¿Eliminar a ${u.name}?`)) deleteUser(u.id);
                        }}
                        className="p-2 rounded-lg hover:bg-rose-400/10 text-ink-muted hover:text-rose-400"
                      >
                        <Trash2 aria-hidden="true" className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="user-modal-title"
          onKeyDown={(e) => e.key === "Escape" && setEditing(null)}
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-strong w-full max-w-md p-6"
          >
            <div className="flex items-center justify-between mb-5">
              <h2 id="user-modal-title" className="text-lg font-bold">
                {("id" in editing && editing.id) ? "Editar usuario" : "Nuevo usuario"}
              </h2>
              <button
                type="button"
                aria-label="Cerrar diálogo"
                onClick={() => setEditing(null)}
                className="p-2 rounded-lg hover:bg-white/5"
              >
                <X aria-hidden="true" className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-[10px] uppercase tracking-wider text-ink-muted">Nombre</label>
                <input
                  value={editing.name}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                  className="input w-full mt-1"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-ink-muted">Email</label>
                <input
                  type="email"
                  value={editing.email}
                  onChange={(e) => setEditing({ ...editing, email: e.target.value })}
                  className="input w-full mt-1"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-ink-muted">Rol</label>
                <select
                  value={editing.role}
                  onChange={(e) =>
                    setEditing({ ...editing, role: e.target.value as Role })
                  }
                  className="input w-full mt-1"
                >
                  <option value="admin">Administrador</option>
                  <option value="cajero">Cajero</option>
                  <option value="entrenador">Entrenador</option>
                </select>
              </div>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={editing.active}
                  onChange={(e) => setEditing({ ...editing, active: e.target.checked })}
                  className="w-4 h-4 accent-accent"
                />
                Usuario activo
              </label>
            </div>
            <div className="flex items-center justify-end gap-2 mt-5">
              <button onClick={() => setEditing(null)} className="btn-ghost">
                Cancelar
              </button>
              <button onClick={save} className="btn-primary">
                <Save className="w-3.5 h-3.5" />
                Guardar
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
