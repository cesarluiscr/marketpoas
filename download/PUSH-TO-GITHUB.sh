#!/bin/bash
# Script para subir MarketPoás a GitHub
# Ejecuta este script después de descargar el zip

echo "=== Subiendo MarketPoás a GitHub ==="

# 1. Descomprimir
mkdir -p marketpoas
cd marketpoas
unzip ../marketpoas-github.zip

# 2. Inicializar git
git init
git add -A
git commit -m "MarketPoás - Marketplace del cantón de Poás"

# 3. Pedir URL del repo
echo ""
echo "¿Cuál es la URL de tu repositorio de GitHub?"
echo "Ejemplo: https://github.com/tuusuario/marketpoas.git"
read REPO_URL

# 4. Subir a GitHub
git remote add origin "$REPO_URL"
git branch -M main
git push -u origin main

echo ""
echo "=== ¡Listo! Código subido a GitHub ==="
echo "Ahora ve a vercel.com para desplegar gratis"
