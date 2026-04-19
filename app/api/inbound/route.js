import { prisma } from '@/lib/prisma'

export async function POST(req) {
  try {
    const body = await req.json()
    const { name, quantity, locationCode } = body

    const qty = Number(quantity)

    // validate
    if (!name || !qty || !locationCode) {
      return Response.json(
        { error: 'Missing or invalid fields' },
        { status: 400 }
      )
    }

    if (qty <= 0) {
      return Response.json(
        { error: 'Quantity must be greater than 0' },
        { status: 400 }
      )
    }

    // 1. หา product หรือสร้างใหม่
    let product = await prisma.product.findFirst({
      where: { name }
    })

    if (!product) {
      product = await prisma.product.create({
        data: { name }
      })
    }

    // 2. หา location หรือสร้างใหม่
    let location = await prisma.warehouseLocation.findUnique({
      where: { code: locationCode }
    })

    if (!location) {
      location = await prisma.warehouseLocation.create({
        data: { code: locationCode }
      })
    }

    // 🔥 3. inventory + transaction (atomic)
    const [inventory, transaction] = await prisma.$transaction([
      prisma.inventory.upsert({
        where: {
          productId_locationId: {
            productId: product.id,
            locationId: location.id
          }
        },
        update: {
          quantity: {
            increment: qty
          }
        },
        create: {
          productId: product.id,
          locationId: location.id,
          quantity: qty
        }
      }),
      prisma.transaction.create({
        data: {
          type: 'IN',
          quantity: qty,
          productId: product.id
        }
      })
    ])

    return Response.json({
      message: 'Inbound success',
      product,
      location,
      inventory,
      transaction
    })

  } catch (error) {
    console.error(error)
    return Response.json(
  { error: error.message },
  { status: 500 }
)
  }
}