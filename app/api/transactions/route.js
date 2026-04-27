import { prisma } from '@/lib/prisma'

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url)

    const type = searchParams.get('type')
    const name = searchParams.get('name')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const where = {
      ...(type && { type }),

      ...(name && {
        product: {
          name: {
            contains: name
          }
        }
      }),

      // 🔥 สำคัญมาก
      ...(startDate && endDate && {
        createdAt: {
          gte: new Date(startDate),
          lte: new Date(endDate + 'T23:59:59.999')
        }
      })
    }

    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        product: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return Response.json({ data: transactions })

  } catch (error) {
    console.error(error)

    return Response.json(
      { error: error.message },
      { status: 500 }
    )
  }
}