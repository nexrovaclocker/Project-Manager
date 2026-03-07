import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions)
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const { id } = await params

        const log = await prisma.dailyLog.findUnique({
            where: { id },
            select: { userId: true }
        })

        if (!log) {
            return NextResponse.json({ error: 'Log not found' }, { status: 404 })
        }

        if (session.user.role !== 'admin' && log.userId !== session.user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        await prisma.dailyLog.delete({
            where: { id }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('DAILY_LOG_DELETE_ERROR', error)
        return NextResponse.json({ error: 'Error deleting log' }, { status: 500 })
    }
}
