import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(
    req: Request,
    { params }: { params: Promise<{ userId: string }> }
) {
    const { userId } = await params
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { newPassword, confirmPassword } = await req.json()

    if (!newPassword || !confirmPassword) {
        return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    if (newPassword !== confirmPassword) {
        return NextResponse.json({ error: 'Passwords do not match' }, { status: 400 })
    }

    if (newPassword.length < 4) {
        return NextResponse.json({ error: 'Password too short' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const passwordHash = await bcrypt.hash(newPassword, 12)

    await prisma.user.update({
        where: { id: userId },
        data: { passwordHash },
    })

    return NextResponse.json({ message: 'Password updated' })
}
