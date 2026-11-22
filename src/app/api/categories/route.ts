import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

// GET /api/categories - Listar categorías y distritos disponibles
export async function GET() {
  try {
    const listings = await db.listing.findMany({
      where: { status: 'activo' },
      select: { category: true, location: true },
    })

    const categoryCounts = new Map<string, number>()
    const locationCounts = new Map<string, number>()

    for (const l of listings) {
      categoryCounts.set(l.category, (categoryCounts.get(l.category) ?? 0) + 1)
      locationCounts.set(l.location, (locationCounts.get(l.location) ?? 0) + 1)
    }

    // Categorías canónicas (las que se ofrecen en el formulario)
    const defaultCategories = [
      'Alimentos',
      'Vehículos',
      'Muebles',
      'Animales',
      'Herramientas',
      'Hogar',
      'Jardín',
      'Electrodomésticos',
      'Inmuebles',
      'Servicios',
      'Tecnología',
      'Ropa',
      'Otros',
    ]
    const defaultLocations = ['San Pedro', 'San Juan', 'San Rafael', 'Carrillos', 'Sabana Redonda']

    const categories = defaultCategories.map((c) => ({
      name: c,
      count: categoryCounts.get(c) ?? 0,
    }))
    const locations = defaultLocations.map((l) => ({
      name: l,
      count: locationCounts.get(l) ?? 0,
    }))

    return NextResponse.json({ categories, locations })
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { error: 'Error al obtener categorías' },
      { status: 500 }
    )
  }
}
