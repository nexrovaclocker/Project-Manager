import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
    const session = await getServerSession(authOptions)

    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json().catch(() => ({}))
    const { action } = body // 'start' or 'end'

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { name: true, username: true }
    })
    
    if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const displayName = user.name || user.username || 'User'

    if (action === 'start') {
        await prisma.$transaction([
            prisma.user.update({
                where: { id: session.user.id },
                data: {
                    status: 'break',
                    last_seen: new Date(),
                },
            }),
            prisma.eventLog.create({
                data: {
                    userId: session.user.id,
                    eventType: 'ON_BREAK',
                    detail: `${displayName} started break`,
                    timestamp: new Date(),
                },
            }),
        ])
    } else if (action === 'end') {
        await prisma.$transaction([
            prisma.user.update({
                where: { id: session.user.id },
                data: {
                    status: 'online',
                    last_seen: new Date(),
                },
            }),
            prisma.eventLog.create({
                data: {
                    userId: session.user.id,
                    eventType: 'BRK_END',
                    detail: `${displayName} resumed`,
                    timestamp: new Date(),
                },
            }),
        ])
    } else {
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    return NextResponse.json({ success: true, action })
}
