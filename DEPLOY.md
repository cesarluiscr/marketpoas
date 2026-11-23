# Cómo desplegar MarketPoás en Vercel (gratis)

## Paso 1: Subir a GitHub
1. Crea una cuenta en github.com (si no tienes)
2. Crea un nuevo repositorio llamado "marketpoas"
3. Sube todos los archivos del proyecto

## Paso 2: Conectar Vercel
1. Ve a vercel.com y crea una cuenta (gratis)
2. Toca "New Project"
3. Importa tu repositorio de GitHub
4. Vercel detecta Next.js automáticamente
5. En "Environment Variables" agrega:
   - DATABASE_URL = file:/tmp/marketpoas.db
   - NEXTAUTH_SECRET = marketpoas-secret-key-2026-tech-center-cr
   - NEXTAUTH_URL = https://[tu-proyecto].vercel.app
6. Toca "Deploy"
7. Espera 2-3 minutos

## Paso 3: Crear el admin
Después del deploy, ejecuta el script de creación de admin:
1. Ve a la pestaña "Terminal" en Vercel
2. Ejecuta: bunx tsx scripts/create-admin.ts

## Paso 4: Usar la URL en el APK
La URL será algo como: https://marketpoas-xxxxx.vercel.app
Usa esa URL en el APK de Android.

## Credenciales admin
Email: admin@marketpoas.cr
Contraseña: MARKETPOAS2026
