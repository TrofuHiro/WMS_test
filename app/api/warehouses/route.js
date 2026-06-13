import { prisma } from '@/lib/prisma'

export async function GET() {
  try {

    const locations =
      await prisma.warehouseLocation.findMany({
        include: {
          inventories: {
            include: {
              product: true
            }
          }
        }
      })

    const data = locations.map(location => ({
      id: location.id,
      code: location.code,

      totalProducts:
        location.inventories.length,

      totalQuantity:
        location.inventories.reduce(
          (sum, item) => sum + item.quantity,
          0
        )
    }))

    return Response.json({ data })

  } catch (error) {

    return Response.json(
      { error: error.message },
      { status: 500 }
    )

  }
}