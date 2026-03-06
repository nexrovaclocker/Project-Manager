import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function DELETE(
    _req: Request,
    { params }: { params: Promise<{ userId: string }> }
) {
    const { userId } = await params
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (userId === session.user.id) {
        return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 403 })
    }

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    await prisma.user.delete({ where: { id: userId } })

    return NextResponse.json({ message: 'User deleted' })
}
