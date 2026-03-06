import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function GET() {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const users = await prisma.user.findMany({
        select: { id: true, name: true, username: true, role: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(users)
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name, username, password, role } = await req.json()

    if (!name || !username || !password) {
        return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    const existing = await prisma.user.findUnique({ where: { username } })
    if (existing) {
        return NextResponse.json({ error: 'Username taken' }, { status: 400 })
    }

    const passwordHash = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
        data: {
            name,
            username,
            passwordHash,
            role: role || 'member',
        },
        select: { id: true, name: true, username: true, role: true },
    })

    return NextResponse.json(user)
}
