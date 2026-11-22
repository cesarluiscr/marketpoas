import { db } from '@/lib/db'

async function main() {
  console.log('Eliminando TODAS las publicaciones de ejemplo...')

  const counts = {
    listings: await db.listing.count(),
    favorites: await db.favorite.count(),
    questions: await db.question.count(),
    offers: await db.offer.count(),
    reports: await db.report.count(),
    messages: await db.message.count(),
    conversations: await db.conversation.count(),
    notifications: await db.notification.count(),
    reviews: await db.review.count(),
    savedSearches: await db.savedSearch.count(),
    businesses: await db.business.count(),
    events: await db.event.count(),
    bulletins: await db.bulletin.count(),
    users: await db.user.count(),
  }

  console.log('Antes:', JSON.stringify(counts, null, 2))

  // Eliminar en orden de dependencias
  await db.message.deleteMany({})
  await db.conversation.deleteMany({})
  await db.favorite.deleteMany({})
  await db.offer.deleteMany({})
  await db.question.deleteMany({})
  await db.report.deleteMany({})
  await db.review.deleteMany({})
  await db.notification.deleteMany({})
  await db.savedSearch.deleteMany({})
  await db.listing.deleteMany({})
  await db.business.deleteMany({})
  await db.event.deleteMany({})
  await db.bulletin.deleteMany({})
  // NO eliminar usuarios (mantener el admin)

  const after = {
    listings: await db.listing.count(),
    favorites: await db.favorite.count(),
    questions: await db.question.count(),
    offers: await db.offer.count(),
    reports: await db.report.count(),
    messages: await db.message.count(),
    conversations: await db.conversation.count(),
    notifications: await db.notification.count(),
    reviews: await db.review.count(),
    savedSearches: await db.savedSearch.count(),
    businesses: await db.business.count(),
    events: await db.event.count(),
    bulletins: await db.bulletin.count(),
    users: await db.user.count(),
  }
  console.log('Después:', JSON.stringify(after, null, 2))
  console.log('')
  console.log('✓ Todo limpio. Solo queda el usuario admin.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
