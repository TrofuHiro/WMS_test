import { prisma } from '@/lib/prisma'

function parseThaiDate(dateStr) {
  if (!dateStr) return null

  const [day, month, year] = dateStr.split('/')
  const christianYear = Number(year) - 543

  return new Date(christianYear, Number(month) - 1, Number(day))
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url)

    const startDateRaw = searchParams.get('startDate')
    const endDateRaw = searchParams.get('endDate')

    const startDate = parseThaiDate(startDateRaw)
    const endDate = parseThaiDate(endDateRaw)

    let where = {}

    if (startDate && endDate) {
      where.createdAt = {
        gte: startDate,
        lte: endDate
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