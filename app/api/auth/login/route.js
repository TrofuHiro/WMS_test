import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

export async function POST(req) {

  try {

    const body = await req.json()

    const { email, password } = body

    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return Response.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const valid = await bcrypt.compare(
      password,
      user.password
    )

    if (!valid) {
      return Response.json(
        { error: 'Invalid password' },
        { status: 401 }
      )
    }

    const token = jwt.sign(
  {
    id:user.id,
    role:user.role,
    name:user.name
  },
  process.env.JWT_SECRET,
  {
    expiresIn:'7d'
  }
)

    return Response.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    })

  } catch (error) {

    return Response.json(
      { error: error.message },
      { status: 500 }
    )

  }

}