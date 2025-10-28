# 🚀 Instrucciones para Desplegar en Vercel

## Paso 1: Verificar que el Proyecto Funciona Localmente

1. Abre una terminal en la carpeta `frontend`
2. Instala las dependencias:
```bash
npm install
```

3. Ejecuta el servidor de desarrollo:
```bash
npm run dev
```

4. Abre tu navegador en [http://localhost:3000](http://localhost:3000)

## Paso 2: Preparar entorno

Define `POSTGRES_URL`:

En desarrollo local (`frontend/.env.local`):
```bash
POSTGRES_URL="postgres://usuario:password@host:port/dbname?sslmode=require"
```

En Vercel (Project Settings → Environment Variables):
- Key: `POSTGRES_URL`
- Value: cadena de conexión (pooled) desde Vercel Postgres
- Environment: Production y Preview

## Paso 3: Preparar para Despliegue

Verifica que el build funcione correctamente:

```bash
npm run build
```

Si esto funciona sin errores, estás listo para desplegar.

## Paso 4: Desplegar en Vercel

### Opción A: Desde la Web (RECOMENDADO)

1. **Ir a Vercel.com**
   - Visita [https://vercel.com/signup](https://vercel.com/signup)
   - Inicia sesión con tu cuenta de GitHub, GitLab o Bitbucket

2. **Importar Proyecto**
   - Haz clic en "Add New Project"
   - Selecciona "Import Git Repository"
   - Si tu código está en GitHub, selecciónalo de la lista
   - Si no está en GitHub:
     - Sube tu código a GitHub primero
     - Luego conéctalo

3. **Configurar Proyecto**
   - Vercel detectará automáticamente Next.js
   - **IMPORTANTE**: Configura el directorio raíz como `frontend`
     - En las opciones de configuración, busca "Root Directory"
     - Escríbelo como: `frontend`
   - Variables de entorno: agrega `POSTGRES_URL`

4. **Desplegar**
   - Haz clic en "Deploy"
   - Espera 1-2 minutos
   - ¡Tu app estará en vivo con una URL de Vercel!

### Opción B: Desde la Terminal

1. **Instalar Vercel CLI**
```bash
npm i -g vercel
```

2. **Iniciar sesión**
```bash
vercel login
```

3. **Ir a la carpeta frontend**
```bash
cd frontend
```

4. **Desplegar**
```bash
vercel
```

5. **Seguir las instrucciones**
   - ¿Set up and deploy? **Sí**
   - ¿Which scope? Selecciona tu cuenta
   - ¿Link to existing project? **No** (primera vez)
   - ¿What's your project's name? inventario-almacen
   - ¿In which directory is your code located? **./**

6. **Tu URL estará lista!**

### Opción C: Automático con GitHub (CI)

Si ya tienes tu código en GitHub:

1. **Crear archivo `.github/workflows/deploy.yml`** en la raíz del proyecto:
```yaml
name: Deploy to Vercel
on:
  push:
    branches: [main, master]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
      - name: Install dependencies
        run: |
          cd frontend
          npm install
      - name: Build
        run: |
          cd frontend
          npm run build
```

2. **Conectar GitHub a Vercel**:
   - Ve a Vercel dashboard
   - "Add New Project"
   - Selecciona tu repositorio
   - Configura root directory como `frontend`
    - Agrega `POSTGRES_URL` en Environment Variables

## Características del Sistema

✅ **Persistencia con Vercel Postgres**: Datos centralizados y disponibles desde cualquier dispositivo
✅ **Interfaz moderna**: Diseño limpio con Tailwind CSS
✅ **Dark mode**: Soporte automático para modo oscuro
✅ **Responsive**: Funciona en móvil, tablet y desktop
✅ **Sin backend**: Todo funciona con Next.js y localStorage

## Limitaciones Actuales

⚠️ **Variables de entorno**: Sin `POSTGRES_URL`, los endpoints `/api/*` fallarán. Configura esta variable en local y en Vercel.

## Próximos Pasos (Opcional)

1. **Personalizar dominio**: En Vercel dashboard, ve a Settings → Domains
2. **Agregar base de datos**: Considera usar Vercel Postgres
3. **Autenticación**: Implementa login de usuarios
4. **Backup**: Crea scripts para exportar datos

## ¿Problemas?

- **Error de build**: Revisa los logs en Vercel dashboard
- **Datos no persisten**: localStorage funciona por dominio, cada deploy limpia localStorage
- **404 en rutas**: Asegúrate de que Next.js 16 esté bien configurado

## Contacto y Soporte

Si tienes dudas sobre el despliegue, revisa la documentación oficial:
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Vercel Documentation](https://vercel.com/docs)

