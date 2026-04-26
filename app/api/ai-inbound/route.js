import { prisma } from '@/lib/prisma'

export async function POST(req) {
  try {
    const { message } = await req.json()

    // 🧠 Improved Regex (รองรับชื่อยาว + flexible)
    const regex = /(?:รับสินค้า|เพิ่มสินค้า)?\s*(.*?)\s*(?:จำนวน)?\s*(\d+)\s*(?:ที่)?\s*([A-Za-z0-9]+)$/i

    const match = message.match(regex)

    if (!match) {
      return Response.json(
        { error: '❌ ไม่เข้าใจข้อความ' },
        { status: 400 }
      )
    }

    const name = match[1].trim()
    const quantity = Number(match[2])
    const locationCode = match[3].toUpperCase()

    // ✅ validation
    if (!name || !quantity || !locationCode) {
      return Response.json(
        { error: 'Missing fields' },
        { status: 400 }
      )
    }

    if (quantity <= 0) {
      return Response.json(
        { error: 'Quantity must be > 0' },
        { status: 400 }
      )
    }

    console.log('🤖 Parsed:', { name, quantity, locationCode })

    // =========================
    // 🧩 DB LOGIC (Prisma)
    // =========================

    // 1. หา/สร้าง product
    let product = await prisma.product.findFirst({
      where: { name }
    })

    if (!product) {
      product = await prisma.product.create({
        data: { name }
      })
    }

    // 2. หา/สร้าง location
    let location = await prisma.warehouseLocation.findUnique({
      where: { code: locationCode }
    })

    if (!location) {
      location = await prisma.warehouseLocation.create({
        data: { code: locationCode }
      })
    }

    // 3. inventory + transaction
    const [inventory, transaction] = await prisma.$transaction([
      prisma.inventory.upsert({
        where: {
          productId_locationId: {
            productId: product.id,
            locationId: location.id
          }
        },
        update: {
          quantity: { increment: quantity }
        },
        create: {
          productId: product.id,
          locationId: location.id,
          quantity: quantity
        }
      }),
      prisma.transaction.create({
        data: {
          type: 'IN',
          quantity: quantity,
          productId: product.id
        }
      })
    ])

    return Response.json({
      message: '✅ AI Inbound success',
      parsed: { name, quantity, locationCode },
      product,
      location,
      inventory,
      transaction
    })

  } catch (err) {
    console.error(err)
    return Response.json(
      { error: 'AI inbound error' },
      { status: 500 }
    )
  }
}