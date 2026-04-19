import { prisma } from '@/lib/prisma'

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url)

    const type = searchParams.get('type') // IN / OUT
    const name = searchParams.get('name')

    const transactions = await prisma.transaction.findMany({
      where: {
        ...(type && { type }),
        ...(name && {
          product: {
            name: {
              contains: name
            }
          }
        })
      },
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