export async function GET(req) {
  const { searchParams } = new URL(req.url)

  const name = searchParams.get('name')
  const locationCode = searchParams.get('locationCode')

  // ✅ pagination
  const page = Number(searchParams.get('page') || 1)
  const limit = Number(searchParams.get('limit') || 10)
  const skip = (page - 1) * limit

  const where = {
    ...(name && {
      product: {
        name: {
          contains: name
        }
      }
    }),

    ...(locationCode && {
      location: {
        code: locationCode
      }
    })
  }

  const [data, total] = await Promise.all([
    prisma.inventory.findMany({
      where,
      include: {
        product: true,
        location: true
      },
      skip,
      take: limit
    }),
    prisma.inventory.count({ where })
  ])

  return Response.json({
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  })
}