# Training School — Tienda OS

Plataforma demo de gestión de tienda para **Training School** (gimnasio en Medellín).
Inventario, punto de venta, ventas, usuarios con roles y un **asesor IA (Coach Pro)** que analiza inventario y ventas en vivo para recomendar reabastecimiento, márgenes y tendencias.

> Esta demo NO incluye módulo de membresías/mensualidades — el cliente ya tiene un sistema para eso. El foco está en lo que **NO tienen administrado**: la tienda (suplementos + tecnología + accesorios).

## Stack

- **Next.js 15** (App Router) · **React 18** · **TypeScript**
- **Tailwind CSS 3** + diseño glassmorphism / dark-first / neon accent
- **Zustand** con persistencia en `localStorage` (sin DB para demo — listo para reemplazar por Postgres)
- **Recharts** para gráficas, **Framer Motion** para animaciones, **Lucide** para iconos
- **Anthropic SDK (Claude Haiku 4.5)** en route handler `/api/chat` con fallback offline

## Páginas

| Ruta | Descripción |
|---|---|
| `/` | Dashboard ejecutivo con KPIs, gráficas y stock crítico |
| `/pos` | Punto de venta con carrito, métodos de pago y descuento de stock |
| `/inventario` | CRUD de productos con categorías (suplementos, tecnología, accesorios) |
| `/ventas` | Histórico de ventas con filtros por día y método de pago |
| `/usuarios` | Gestión de equipo con matriz de permisos por rol |
| `/asesor` | Chat con Coach Pro, IA que analiza inventario y ventas en tiempo real |

## Roles y permisos

- **Administrador** — acceso completo
- **Cajero** — POS, inventario (solo lectura), ventas, asesor IA
- **Entrenador** — inventario (solo lectura), asesor IA

Cambio de usuario en vivo desde el avatar superior derecho (simulación de auth para demo).

## Productos seed

Marcas reales del mercado colombiano:
- **MuscleTech** (Cell-Tech, Nitro-Tech, VaporX5)
- **Iron Nutrition** (Whey, Creatina, BCAA)
- **Smart** (Protein, Creatina)
- Tecnología (Sony, Xiaomi, Anker, HidrateSpark) y accesorios

## Desarrollo

```bash
npm install
cp .env.example .env.local   # editar con tu ANTHROPIC_API_KEY
npm run dev                   # http://localhost:3000
```

## Despliegue a Vercel

```bash
npx vercel              # primer deploy (preview)
npx vercel --prod       # producción
```

Variables de entorno en Vercel:
- `ANTHROPIC_API_KEY` — opcional. Sin ella el asesor IA usa modo fallback con análisis local de stock crítico, top sellers y márgenes.

## Reset de datos

En `/usuarios` → botón **Reset demo** restaura el catálogo, usuarios y ventas seed.
# training-school
