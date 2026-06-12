import { PrismaClient }
  from '@prisma/client'

const prisma =
  new PrismaClient()

export async function GET() {

  try {

    const users =
      await prisma.user.findMany({

        select: {
          id: true,
          name: true,
          email: true,
          role: true
        },

        orderBy: {
          name: 'asc'
        }

      })

    return Response.json({
      success: true,
      data: users
    })

  } catch (err) {

    return Response.json(
      {
        success: false,
        error:
          err.message
      },
      {
        status: 500
      }
    )

  }

}