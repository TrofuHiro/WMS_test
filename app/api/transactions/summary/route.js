import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const transactions = await prisma.transaction.groupBy({
      by: ['type'],
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