import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
    const session = await getServerSession(authOptions)

    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const activeSession = await prisma.clockSession.findFirst({
        where: {
            userId: session.user.id,
            clockOut: null,
        },
    })

    if (activeSession) {
        return NextResponse.json(
            { error: 'Already clocked in' },
            { status: 400 }
        )
    }

    const body = await req.json().catch(() => ({}))
    const { manualTime } = body

    let clockIn = new Date()
    if (manualTime) {
        const [hours, minutes] = manualTime.split(':').map(Number)
        clockIn = new Date()
        clockIn.setHours(hours, minutes, 0, 0)

        // If the generated time is significantly in the future, the user likely meant yesterday
        if (clockIn.getTime() > Date.now() + 60 * 60 * 1000) {
            clockIn = new Date(clockIn.getTime() - 24 * 60 * 60 * 1000)
        }
    }

    const newSession = await prisma.clockSession.create({
        data: {
            userId: session.user.id,
            clockIn,
        },
    })

    // Update user status and insert EventLog
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
                eventType: 'CLOCK_IN',
                detail: 'Clocked in',
                timestamp: new Date(),
            },
        }),
    ])

    return NextResponse.json(newSession)
}
