import { prisma } from '@/lib/prisma'

export async function GET(
  request,
  { params }
) {

  const { id } = await params

  try {

    const warehouse =
      await prisma.warehouseLocation.findUnique({

        where: {
          id: Number(id)
        },

        include: {
          inventories: {
            include: {
              product: true
            }
          }
        }

      })

    if (!warehouse) {

      return Response.json(
        { error: 'Warehouse not found' },
        { status: 404 }
      )

    }

    return Response.json({
      data: warehouse
    })

  } catch (error) {

    return Response.json(
      { error: error.message },
      { status: 500 }
    )

  }

}