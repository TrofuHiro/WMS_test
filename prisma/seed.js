import bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {

  const password = await bcrypt.hash('123456', 10)

  await prisma.user.upsert({
    where: {
      email: 'bajirawat3@gmail.com'
    },
    update: {},
    create: {
      name: 'Staff',
      email: 'bajirawat3@gmail.com',
      password,
      role: 'STAFF'
    }
  })

  console.log('Staff created')
}

main()