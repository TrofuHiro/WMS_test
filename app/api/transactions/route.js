import { prisma } from '@/lib/prisma'

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url)

    const type = searchParams.get('type')
    const name = searchParams.get('name')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // ✅ pagination
    const page = Number(searchParams.get('page') || 1)
    const limit = Number(searchParams.get('limit') || 10)
    const skip = (page - 1) * limit

    const where = {
      ...(type && { type }),

      ...(name && {
        product: {
          name: {
            contains: name
          }
        }
      }),

      ...(startDate && endDate && {
        createdAt: {
          gte: new Date(startDate),
          lte: new Date(endDate + 'T23:59:59.999')
        }
      })
    }

    // 🔥 ยิง 2 query
    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: {
          product: true
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),

      prisma.transaction.count({ where })
    ])

    return Response.json({
      data: transactions,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error(error)

    return Response.json(
      { error: error.message },
      { status: 500 }
    )
  }
}