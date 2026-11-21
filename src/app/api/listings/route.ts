import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// Coordenadas aproximadas de los distritos del cantón de Poás
const DISTRICT_COORDS: Record<string, { lat: number; lng: number }> = {
  'San Pedro': { lat: 10.0746, lng: -84.2336 },
  'San Juan': { lat: 10.0587, lng: -84.2167 },
  'Carrizal': { lat: 10.0920, lng: -84.2510 },
  'Sabana Redonda': { lat: 10.1080, lng: -84.2230 },
}

// GET /api/listings - Listar anuncios con filtros opcionales
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const category = searchParams.get('category')
    const location = searchParams.get('location')
    const search = searchParams.get('search')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const sort = searchParams.get('sort') ?? 'recent'

    const where: any = { status: 'activo' }

    if (type && (type === 'venta' || type === 'compra')) {
      where.type = type
    }
    if (category && category !== 'todas') {
      where.category = category
    }
    if (location && location !== 'todas') {
      where.location = location
    }
    if (minPrice) {
      const p = parseFloat(minPrice)
      if (!Number.isNaN(p)) where.price = { ...where.price, gte: p }
    }
    if (maxPrice) {
      const p = parseFloat(maxPrice)
      if (!Number.isNaN(p)) where.price = { ...where.price, lte: p }
    }

    // Búsqueda insensible a acentos y mayúsculas
    if (search) {
      const normalize = (s: string) =>
        s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      const allActive = await db.listing.findMany({
        where: { status: 'activo', ...where },
      })
      const normSearch = normalize(search)
      const filtered = allActive.filter((l) => {
        const t = normalize(`${l.title} ${l.description}`)
        return t.includes(normSearch)
      })
      filtered.sort((a, b) => {
        if (sort === 'price_asc') return a.price - b.price
        if (sort === 'price_desc') return b.price - a.price
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      })
      return NextResponse.json({ listings: filtered })
    }

    let orderBy: any = { createdAt: 'desc' }
    if (sort === 'price_asc') orderBy = { price: 'asc' }
    if (sort === 'price_desc') orderBy = { price: 'desc' }

    const listings = await db.listing.findMany({
      where,
      orderBy,
      include: { user: { select: { name: true, image: true } } },
    })

    return NextResponse.json({ listings })
  } catch (error) {
    console.error('Error fetching listings:', error)
    return NextResponse.json(
      { error: 'Error al obtener anuncios' },
      { status: 500 }
    )
  }
}

// POST /api/listings - Crear nuevo anuncio
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const body = await request.json()

    const {
      type,
      title,
      description,
      price,
      currency,
      category,
      condition,
      location,
      imageUrl,
      contactName,
      contactPhone,
      contactWhatsapp,
    } = body

    if (!type || !['venta', 'compra'].includes(type)) {
      return NextResponse.json({ error: 'Tipo inválido' }, { status: 400 })
    }
    if (!title || title.trim().length < 3) {
      return NextResponse.json({ error: 'Título muy corto' }, { status: 400 })
    }
    if (!description || description.trim().length < 10) {
      return NextResponse.json({ error: 'Descripción muy corta' }, { status: 400 })
    }
    if (price === undefined || price === null || Number.isNaN(Number(price))) {
      return NextResponse.json({ error: 'Precio inválido' }, { status: 400 })
    }
    if (!category) {
      return NextResponse.json({ error: 'Categoría requerida' }, { status: 400 })
    }
    if (!contactName || !contactPhone) {
      return NextResponse.json({ error: 'Contacto requerido' }, { status: 400 })
    }

    const coords = DISTRICT_COORDS[location] ?? DISTRICT_COORDS['San Pedro']

    const listing = await db.listing.create({
      data: {
        type,
        title: title.trim(),
        description: description.trim(),
        price: Number(price),
        currency: currency ?? 'CRC',
        category,
        condition: condition ?? 'usado',
        location: location ?? 'Poás',
        lat: coords.lat + (Math.random() - 0.5) * 0.012, // dispersión
        lng: coords.lng + (Math.random() - 0.5) * 0.012,
        imageUrl: imageUrl ?? null,
        contactName: contactName.trim(),
        contactPhone: contactPhone.trim(),
        contactWhatsapp: contactWhatsapp?.trim() ?? null,
        status: 'activo',
        userId: session?.user?.id ?? null,
      },
    })

    return NextResponse.json({ listing }, { status: 201 })
  } catch (error) {
    console.error('Error creating listing:', error)
    return NextResponse.json({ error: 'Error al crear anuncio' }, { status: 500 })
  }
}
