import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'

export async function POST(req) {
  const user = getUserFromRequest(req)

  if (!user) {
    return Response.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }
  if (
    user.role !== 'ADMIN' &&
    user.role !== 'STAFF'
  ) {
    return Response.json(
      { error: 'Forbidden' },
      { status: 403 }
    )
  }
  try {
    const body = await req.json()
    const { name, quantity, locationCode } = body

    const qty = Number(quantity)

if (
  !name ||
  !locationCode ||
  isNaN(qty)
) {
  return Response.json(
    { error: 'Invalid input' },
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
    const [inventory, transaction, auditLog] = await prisma.$transaction([
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
          productId: product.id,
          locationId: location.id
        }
      }),
      prisma.auditLog.create({
  data: {
    action: 'INBOUND',
    userId: user.id
  }
})
    ])

    return Response.json({
  message: 'Inbound success',
  product,
  location,
  inventory,
  transaction,
  auditLog
})

  } catch (error) {
    console.error(error)
    return Response.json(
  { error: error.message },
  { status: 500 }
)
  }
}