import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

// GET /api/listings - Listar anuncios con filtros opcionales
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // 'venta' | 'compra'
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

    // Búsqueda insensible a acentos y mayúsculas (SQLite LIKE no maneja acentos)
    if (search) {
      // Normalizar quitando acentos y pasando a minúsculas
      const normalize = (s: string) =>
        s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      // Traer todos los activos y filtrar en memoria (es Poás, pocos anuncios)
      const allActive = await db.listing.findMany({
        where: { status: 'activo', ...(where.type ? { type: where.type } : {}), ...(where.category ? { category: where.category } : {}), ...(where.location ? { location: where.location } : {}), ...(where.price ? { price: where.price } : {}) },
      })
      const normSearch = normalize(search)
      const filtered = allActive.filter((l) => {
        const t = normalize(`${l.title} ${l.description}`)
        return t.includes(normSearch)
      })
      // Ordenar
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

    // Validaciones básicas
    if (!type || !['venta', 'compra'].includes(type)) {
      return NextResponse.json(
        { error: 'Tipo inválido. Debe ser "venta" o "compra"' },
        { status: 400 }
      )
    }
    if (!title || title.trim().length < 3) {
      return NextResponse.json(
        { error: 'El título debe tener al menos 3 caracteres' },
        { status: 400 }
      )
    }
    if (!description || description.trim().length < 10) {
      return NextResponse.json(
        { error: 'La descripción debe tener al menos 10 caracteres' },
        { status: 400 }
      )
    }
    if (price === undefined || price === null || Number.isNaN(Number(price))) {
      return NextResponse.json(
        { error: 'Precio inválido' },
        { status: 400 }
      )
    }
    if (!category) {
      return NextResponse.json(
        { error: 'Categoría requerida' },
        { status: 400 }
      )
    }
    if (!contactName || !contactPhone) {
      return NextResponse.json(
        { error: 'Contacto requerido (nombre y teléfono)' },
        { status: 400 }
      )
    }

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
        imageUrl: imageUrl ?? null,
        contactName: contactName.trim(),
        contactPhone: contactPhone.trim(),
        contactWhatsapp: contactWhatsapp?.trim() ?? null,
        status: 'activo',
      },
    })

    return NextResponse.json({ listing }, { status: 201 })
  } catch (error) {
    console.error('Error creating listing:', error)
    return NextResponse.json(
      { error: 'Error al crear anuncio' },
      { status: 500 }
    )
  }
}
