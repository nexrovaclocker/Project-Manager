import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const targetUserId = searchParams.get('userId') || session.user.id

    // Only admins can view other users' stats
    if (session.user.role !== 'admin' && targetUserId !== session.user.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    try {
        const now = new Date()
        const fortyEightHoursAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000)

        const sessions = await prisma.clockSession.findMany({
            where: {
                userId: targetUserId,
                clockIn: {
                    gte: fortyEightHoursAgo
                }
            },
            include: {
                user: {
                    select: { username: true }
                }
            },
            orderBy: { clockIn: 'desc' }
        })

        return NextResponse.json(sessions)
    } catch (error) {
        console.error('API_STATS_ERROR', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
