import { prisma } from '@/lib/prisma'

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url)

    const name = searchParams.get('name')
    const locationCode = searchParams.get('locationCode')

    const inventories = await prisma.inventory.findMany({
      where: {
        ...(name && {
          product: {
            name: {
              contains: name,
            }
          }
        }),
        ...(locationCode && {
          location: {
            code: locationCode
          }
        })
      },
      include: {
        product: true,
        location: true
      },
      orderBy: {
        id: 'desc'
      }
    })

    return Response.json({
      data: inventories
    })

  } catch (error) {
    console.error(error)

    return Response.json(
      { error: error.message },
      { status: 500 }
    )
  }
}