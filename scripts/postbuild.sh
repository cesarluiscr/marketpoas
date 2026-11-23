#!/bin/bash
echo "Running Prisma DB push on Vercel..."
npx prisma db push --accept-data-loss
echo "Creating admin user if not exists..."
node -e "
const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');
const prisma = new PrismaClient();
async function main() {
  const hash = crypto.createHash('sha256').update('marketpoas-salt-2026' + 'MARKETPOAS2026').digest('hex');
  const existing = await prisma.user.findUnique({ where: { email: 'admin@marketpoas.cr' } });
  if (!existing) {
    await prisma.user.create({ data: { email: 'admin@marketpoas.cr', name: 'Administrador MarketPoás', role: 'admin', passwordHash: hash, kycStatus: 'verificado' } });
    console.log('Admin created');
  } else {
    console.log('Admin exists');
  }
}
main().finally(() => prisma.\$disconnect());
"
