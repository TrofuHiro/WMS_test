import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export async function GET() {
  try {

    const users = await prisma.user.findMany({
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
        error: err.message
      },
      {
        status: 500
      }
    )

  }
}

export async function POST(req) {
  try {

    const body = await req.json()

    const {
      name,
      email,
      password,
      role
    } = body

    const exists =
      await prisma.user.findUnique({
        where: { email }
      })

    if (exists) {
      return Response.json(
        {
          error: 'Email already exists'
        },
        {
          status: 400
        }
      )
    }

    const hashedPassword =
      await bcrypt.hash(password, 10)

    const user =
      await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role
        }
      })

    return Response.json({
      success: true,
      user
    })

  } catch (err) {

    return Response.json(
      {
        success: false,
        error: err.message
      },
      {
        status: 500
      }
    )

  }
}