﻿# Sistema de Inventario ðŸ“¦

Sistema completo de gestiÃ³n de inventario con Next.js, Tailwind CSS y TypeScript.

## Funcionalidades

## Acceso y roles

- **Administrador** (admin / admin123 por defecto): acceso total a productos, entradas, salidas, resumen y ajustes de precios.
- **Vendedor** (seller / seller123 por defecto): acceso exclusivo a la pantalla de salidas; el resto de las secciones queda bloqueado automaticamente.
- Puedes sobrescribir las credenciales mediante las variables de entorno DEFAULT_ADMIN_USER, DEFAULT_ADMIN_PASSWORD, DEFAULT_SELLER_USER y DEFAULT_SELLER_PASSWORD.
- El resumen financiero ahora muestra actividad por vendedor con conteos de ventas por dia, semana y mes.

### ðŸŽ¯ Productos
- GestiÃ³n completa de productos con:
  - Nombre y cÃ³digo
  - Costo unitario y precio de venta
  - Stock actual
  - Total invertido en compras

### â¬‡ï¸ Entradas (Compras)
- Registro de compras de productos
- Suma automÃ¡tica de stock
- CÃ¡lculo de costo total
- Historial de todas las entradas

### â¬†ï¸ Salidas (Ventas)
- Registro de ventas de productos
- Resta automÃ¡tica de stock
- CÃ¡lculo de ingresos por venta
- ValidaciÃ³n de stock disponible
- Historial de todas las ventas

### ðŸ’° Resumen Financiero
- Total invertido en compras
- Total vendido
- Ganancia bruta
- EstadÃ­sticas de productos
- Alertas de pÃ©rdidas

## TecnologÃ­as

- **Next.js 16** - Framework React
- **TypeScript** - Tipado estÃ¡tico
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

## ConfiguraciÃ³n de Entorno

Crea un archivo `.env.local` en la carpeta `frontend` (ya estÃ¡ ignorado por Git) con:

```bash
POSTGRES_URL="postgres://usuario:password@host:port/dbname?sslmode=require"
```

Para despliegues en Vercel, define `POSTGRES_URL` en Project Settings â†’ Environment Variables.

## Despliegue en Vercel

### OpciÃ³n 1: Desde la lÃ­nea de comandos

1. Instala la CLI de Vercel:
```bash
npm i -g vercel
```

2. Desde la carpeta `frontend`, ejecuta:
```bash
vercel
```

3. Sigue las instrucciones en pantalla

### OpciÃ³n 2: AutomÃ¡tico desde GitHub (RECOMENDADO)

1. Sube tu cÃ³digo a GitHub (o crea el repo y haz `git push`)
2. En Vercel, haz clic en â€œAdd New Projectâ€ â†’ â€œImport Git Repositoryâ€
3. En configuraciÃ³n inicial:
   - `Root Directory`: `frontend`
   - Variables de entorno: agrega `POSTGRES_URL`
4. Confirma y despliega. Cada push a `main` crearÃ¡ una Preview/Production automÃ¡tica.

### OpciÃ³n 3: Arrastra y suelta

1. Construye el proyecto localmente:
```bash
npm run build
```

2. Ve a [vercel.com/new](https://vercel.com/new)
3. Arrastra la carpeta `.next` generada

## CaracterÃ­sticas del Despliegue

- âœ… Hosting estÃ¡tico y SSR
- âœ… SSL automÃ¡tico
- âœ… URLs personalizadas
- âœ… CDN global
- âœ… Despliegues instantÃ¡neos desde Git
- âœ… Previsualizaciones por cada push/PR

## Nota sobre el Almacenamiento

La app usa **Vercel Postgres** mediante endpoints (`/api/products`, `/api/entries`, `/api/sales`). AsegÃºrate de configurar `POSTGRES_URL` para que el backend funcione tanto en local como en Vercel.

## Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye la aplicaciÃ³n para producciÃ³n
- `npm run start` - Inicia el servidor de producciÃ³n
- `npm run lint` - Ejecuta el linter

## Estructura del Proyecto

```
frontend/
â”œâ”€â”€ app/
â”‚   â”œâ”€â”€ layout.tsx        # Layout principal
â”‚   â”œâ”€â”€ page.tsx          # PÃ¡gina de inicio
â”‚   â”œâ”€â”€ productos/        # PÃ¡gina de productos
â”‚   â”œâ”€â”€ entradas/         # PÃ¡gina de entradas
â”‚   â”œâ”€â”€ salidas/          # PÃ¡gina de salidas
â”‚   â””â”€â”€ resumen/          # PÃ¡gina de resumen
â”œâ”€â”€ components/
â”‚   â””â”€â”€ Navigation.tsx    # Componente de navegaciÃ³n
â”œâ”€â”€ lib/
â”‚   â””â”€â”€ storage.ts        # Llamadas a API (Vercel Postgres)
â””â”€â”€ types/
    â””â”€â”€ index.ts          # Tipos TypeScript
```

## Licencia

Este proyecto es de cÃ³digo abierto y estÃ¡ disponible bajo la licencia MIT.



