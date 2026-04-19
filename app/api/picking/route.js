import { prisma } from '@/lib/prisma'

export async function POST(req) {
  try {
    const body = await req.json()
    const { name, quantity, locationCode } = body

    const qty = Number(quantity)

    // ✅ validate
    if (!name || !locationCode || isNaN(qty) || qty <= 0) {
      return Response.json(
        { error: 'Invalid input' },
        { status: 400 }
      )
    }

    // 1. หา product
    const product = await prisma.product.findFirst({
      where: { name }
    })

    if (!product) {
      return Response.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // 2. หา location
    const location = await prisma.warehouseLocation.findUnique({
      where: { code: locationCode }
    })

    if (!location) {
      return Response.json(
        { error: 'Location not found' },
        { status: 404 }
      )
    }

    // 🔥 3. ใช้ transaction
    const result = await prisma.$transaction(async (tx) => {

      // หา inventory
      const inventory = await tx.inventory.findUnique({
        where: {
          productId_locationId: {
            productId: product.id,
            locationId: location.id
          }
        }
      })

      // ❌ ไม่มี stock
      if (!inventory) {
        throw new Error('No inventory found')
      }

      // ❌ stock ไม่พอ
      if (inventory.quantity < qty) {
        throw new Error('Insufficient stock')
      }

      // ✔️ update stock
      const updatedInventory = await tx.inventory.update({
        where: { id: inventory.id },
        data: {
          quantity: {
            decrement: qty
          }
        }
      })

      // ✔️ log transaction
      const transaction = await tx.transaction.create({
        data: {
          type: 'OUT',
          quantity: qty,
          productId: product.id
        }
      })

      return { updatedInventory, transaction }
    })

    return Response.json({
      message: 'Picking success',
      inventory: result.updatedInventory,
      transaction: result.transaction
    })

  } catch (error) {
    console.error(error)

    return Response.json(
      { error: error.message },
      { status: 500 }
    )
  }
}