# Sistema de Inventario 📦

Sistema completo de gestión de inventario con Next.js, Tailwind CSS y TypeScript.

## Funcionalidades

### 🎯 Productos
- Gestión completa de productos con:
  - Nombre y código
  - Costo unitario y precio de venta
  - Stock actual
  - Total invertido en compras

### ⬇️ Entradas (Compras)
- Registro de compras de productos
- Suma automática de stock
- Cálculo de costo total
- Historial de todas las entradas

### ⬆️ Salidas (Ventas)
- Registro de ventas de productos
- Resta automática de stock
- Cálculo de ingresos por venta
- Validación de stock disponible
- Historial de todas las ventas

### 💰 Resumen Financiero
- Total invertido en compras
- Total vendido
- Ganancia bruta
- Estadísticas de productos
- Alertas de pérdidas

## Tecnologías

- **Next.js 16** - Framework React
- **TypeScript** - Tipado estático
- **Tailwind CSS 4** - Estilos
- **Vercel Postgres** - Persistencia de datos centralizada (API con App Router)

## Desarrollo Local

Primero, instala las dependencias:

```bash
npm install
```

Luego, ejecuta el servidor de desarrollo:

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## Configuración de Entorno

Crea un archivo `.env.local` en la carpeta `frontend` (ya está ignorado por Git) con:

```bash
POSTGRES_URL="postgres://usuario:password@host:port/dbname?sslmode=require"
```

Para despliegues en Vercel, define `POSTGRES_URL` en Project Settings → Environment Variables.

## Despliegue en Vercel

### Opción 1: Desde la línea de comandos

1. Instala la CLI de Vercel:
```bash
npm i -g vercel
```

2. Desde la carpeta `frontend`, ejecuta:
```bash
vercel
```

3. Sigue las instrucciones en pantalla

### Opción 2: Automático desde GitHub (RECOMENDADO)

1. Sube tu código a GitHub (o crea el repo y haz `git push`)
2. En Vercel, haz clic en “Add New Project” → “Import Git Repository”
3. En configuración inicial:
   - `Root Directory`: `frontend`
   - Variables de entorno: agrega `POSTGRES_URL`
4. Confirma y despliega. Cada push a `main` creará una Preview/Production automática.

### Opción 3: Arrastra y suelta

1. Construye el proyecto localmente:
```bash
npm run build
```

2. Ve a [vercel.com/new](https://vercel.com/new)
3. Arrastra la carpeta `.next` generada

## Características del Despliegue

- ✅ Hosting estático y SSR
- ✅ SSL automático
- ✅ URLs personalizadas
- ✅ CDN global
- ✅ Despliegues instantáneos desde Git
- ✅ Previsualizaciones por cada push/PR

## Nota sobre el Almacenamiento

La app usa **Vercel Postgres** mediante endpoints (`/api/products`, `/api/entries`, `/api/sales`). Asegúrate de configurar `POSTGRES_URL` para que el backend funcione tanto en local como en Vercel.

## Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm run start` - Inicia el servidor de producción
- `npm run lint` - Ejecuta el linter

## Estructura del Proyecto

```
frontend/
├── app/
│   ├── layout.tsx        # Layout principal
│   ├── page.tsx          # Página de inicio
│   ├── productos/        # Página de productos
│   ├── entradas/         # Página de entradas
│   ├── salidas/          # Página de salidas
│   └── resumen/          # Página de resumen
├── components/
│   └── Navigation.tsx    # Componente de navegación
├── lib/
│   └── storage.ts        # Llamadas a API (Vercel Postgres)
└── types/
    └── index.ts          # Tipos TypeScript
```

## Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.
