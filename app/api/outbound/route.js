import { prisma } from '@/lib/prisma'

export async function POST(req) {
  try {
    const { productId, locationId, quantity } = await req.json()

    const qty = Number(quantity)

    if (!productId || !locationId || !qty) {
      return Response.json(
        { error: 'missing data' },
        { status: 400 }
      )
    }

    if (qty <= 0) {
      return Response.json(
        { error: 'quantity must be > 0' },
        { status: 400 }
      )
    }

    // 🔍 หา inventory ก่อน
    const inventory = await prisma.inventory.findUnique({
      where: {
        productId_locationId: {
          productId,
          locationId
        }
      }
    })

    if (!inventory) {
      return Response.json(
        { error: 'ไม่พบสินค้าใน location นี้' },
        { status: 404 }
      )
    }

    if (inventory.quantity < qty) {
      return Response.json(
        { error: 'สินค้าไม่พอ' },
        { status: 400 }
      )
    }

    // 🔥 ทำ transaction (สำคัญ)
    const [updatedInventory, transaction] = await prisma.$transaction([
      prisma.inventory.update({
        where: {
          productId_locationId: {
            productId,
            locationId
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
          productId
        }
      })
    ])

    return Response.json({
      message: 'Outbound success',
      updatedInventory,
      transaction
    })

  } catch (err) {
    console.error(err)

    return Response.json(
      { error: 'server error' },
      { status: 500 }
    )
  }
}