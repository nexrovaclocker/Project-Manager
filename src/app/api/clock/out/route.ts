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
    const { sessionNote } = body

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

    const clockOut = new Date()
    const durationMs = clockOut.getTime() - activeSession.clockIn.getTime()
    const durationMinutes = Math.floor(durationMs / 1000 / 60)

    const updatedSession = await prisma.clockSession.update({
        where: { id: activeSession.id },
        data: {
            clockOut,
            durationMinutes,
            sessionNote,
        },
    })

    return NextResponse.json(updatedSession)
}
