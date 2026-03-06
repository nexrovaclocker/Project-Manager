import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST() {
    const session = await getServerSession(authOptions)

    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if there is already an active session
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

    const newSession = await prisma.clockSession.create({
        data: {
            userId: session.user.id,
            clockIn: new Date(),
        },
    })

    return NextResponse.json(newSession)
}
