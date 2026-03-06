import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const existing = await prisma.user.findUnique({ where: { username: 'admin' } })
  if (!existing) {
    const passwordHash = await bcrypt.hash('admin123', 12)
    await prisma.user.create({
      data: {
        name: 'Admin',
        username: 'admin',
        passwordHash,
        role: 'admin',
      },
    })
    console.log('✅ Default admin user created')
  } else {
    console.log('ℹ️  Admin user already exists')
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
