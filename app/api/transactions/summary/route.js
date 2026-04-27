import { prisma } from '@/lib/prisma'

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url)

    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    let where = {}

    if (startDate && endDate) {
      const start = new Date(startDate)
      const end = new Date(endDate)

      // 🔥 ทำให้ end ครอบทั้งวัน (23:59:59.999)
      end.setHours(23, 59, 59, 999)

      where.createdAt = {
        gte: start,
        lte: end
      }
    }

    const transactions = await prisma.transaction.groupBy({
      by: ['type'],
      where,
      _sum: {
        quantity: true
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