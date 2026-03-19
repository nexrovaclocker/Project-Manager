import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
    const session = await getServerSession(authOptions)

    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { sessionNote, manualTime } = body

    // Find active session
    const activeSession = await prisma.clockSession.findFirst({
        where: {
            userId: session.user.id,
            clockOut: null,
        },
    })

    if (!activeSession) {
        return NextResponse.json(
            { error: 'Not clocked in' },
            { status: 400 }
        )
    }

    let clockOut = new Date()
    if (manualTime) {
        const [hours, minutes] = manualTime.split(':').map(Number)
        clockOut = new Date()
        clockOut.setHours(hours, minutes, 0, 0)
    }

    let durationMs = clockOut.getTime() - activeSession.clockIn.getTime()

    // Prevent negative duration if user inputs midnight vs today manually incorrectly, adjust +24h if negative
    if (durationMs < 0) {
        clockOut = new Date(clockOut.getTime() + 24 * 60 * 60 * 1000)
        durationMs = clockOut.getTime() - activeSession.clockIn.getTime()
    }
    const durationMinutes = Math.floor(durationMs / 1000 / 60)

    const updatedSession = await prisma.clockSession.update({
        where: { id: activeSession.id },
        data: {
            clockOut,
            durationMinutes,
            sessionNote,
        },
    })

    // Format duration detail: e.g. "4h 22m" or "45m"
    const hours = Math.floor(durationMinutes / 60)
    const mins = durationMinutes % 60
    const durationFmt = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { name: true, username: true }
    })
    const displayName = user?.name || user?.username || 'User'

    await prisma.$transaction([
        prisma.user.update({
            where: { id: session.user.id },
            data: {
                status: 'offline',
                current_task: null,
                last_seen: new Date(),
            },
        }),
        prisma.eventLog.create({
            data: {
                userId: session.user.id,
                eventType: 'CLOCK_OUT',
                detail: `${displayName} clocked out — ${durationFmt}`,
                timestamp: new Date(),
            },
        }),
    ])

    return NextResponse.json(updatedSession)
}
