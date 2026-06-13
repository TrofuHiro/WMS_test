import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'

export async function POST(req) {
  try {
    console.log(
  req.headers.get('authorization')
)
    // =========================
    // JWT AUTH
    // =========================
    const user = getUserFromRequest(req)

    if (!user) {
      return Response.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // =========================
    // ROLE CHECK
    // =========================
    if (
      user.role !== 'ADMIN' &&
      user.role !== 'STAFF'
    ) {
      return Response.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    // =========================
    // BODY
    // =========================
    const body = await req.json()

    const productName = body.productName
    const locationCode = body.locationCode
    const qty = Number(body.quantity)

    if (
      !productName ||
      !locationCode ||
      qty <= 0
    ) {
      return Response.json(
        { error: 'Missing data' },
        { status: 400 }
      )
    }

    // =========================
    // FIND PRODUCT
    // =========================
    const product =
      await prisma.product.findFirst({
        where: {
          name: productName
        }
      })

    if (!product) {
      return Response.json(
        {
          error: 'ไม่พบสินค้า'
        },
        { status: 404 }
      )
    }

    // =========================
    // FIND LOCATION
    // =========================
    const location =
  await prisma.warehouseLocation.findFirst({
    where: {
      code: locationCode
    }
  })

    if (!location) {
      return Response.json(
        {
          error: 'ไม่พบ Location'
        },
        { status: 404 }
      )
    }

    // =========================
    // FIND INVENTORY
    // =========================
    const inventory =
      await prisma.inventory.findUnique({
        where: {
          productId_locationId: {
            productId: product.id,
            locationId: location.id
          }
        }
      })

    if (!inventory) {
      return Response.json(
        {
          error:
            'ไม่พบสินค้าใน Location นี้'
        },
        { status: 404 }
      )
    }

    if (inventory.quantity < qty) {
      return Response.json(
        {
          error:
            'สินค้าในคลังไม่เพียงพอ'
        },
        { status: 400 }
      )
    }

    // =========================
    // TRANSACTION
    // =========================
    const [
      updatedInventory,
      transaction,
      auditLog
    ] = await prisma.$transaction([

      prisma.inventory.update({
        where: {
          productId_locationId: {
            productId: product.id,
            locationId: location.id
          }
        },
        data: {
          quantity: {
            decrement: qty
          }
        }
      }),

      prisma.transaction.create({
        data: {
          type: 'OUT',
          quantity: qty,
          productId: product.id,
          locationId: location.id
        }
      }),

      prisma.auditLog.create({
        data: {
          action: 'OUTBOUND',
          userId: user.id
        }
      })

    ])

    return Response.json({
      success: true,
      message: 'Outbound Success',
      updatedInventory,
      transaction,
      auditLog
    })

  } catch (error) {

    console.error(error)

    return Response.json(
      {
        error:
          error.message ||
          'Server Error'
      },
      { status: 500 }
    )
  }
}