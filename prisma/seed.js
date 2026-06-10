import bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {

  const password = await bcrypt.hash('123456', 10)

  await prisma.user.upsert({
    where: {
      email: 'bajirawat2@gmail.com'
    },
    update: {},
    create: {
      name: 'Admin',
      email: 'bajirawat2@gmail.com',
      password,
      role: 'ADMIN'
    }
  })

  console.log('Admin created')
}

main()