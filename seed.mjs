import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { readFileSync } from 'fs';

// Manually load .env file
const env = readFileSync('.env', 'utf-8');
for (const line of env.split('\n')) {
  const [key, ...rest] = line.split('=');
  if (key && rest.length) {
    process.env[key.trim()] = rest.join('=').trim().replace(/^"|"$/g, '');
  }
}

const prisma = new PrismaClient();

const hash = await bcrypt.hash('admin123', 12);
await prisma.user.create({
  data: { name: 'Admin', username: 'admin', passwordHash: hash, role: 'admin' }
});
console.log('Admin created!');
await prisma.$disconnect();
