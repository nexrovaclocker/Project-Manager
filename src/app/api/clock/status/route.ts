import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
    const session = await getServerSession(authOptions)

    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Find the active clock session (where clockOut is null)
    const activeSession = await prisma.clockSession.findFirst({
        where: {
            userId: session.user.id,
            clockOut: null,
        },
        orderBy: {
            clockIn: 'desc',
        },
    })

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { status: true }
    })

    return NextResponse.json({
        status: activeSession ? 'clocked_in' : 'clocked_out',
        userStatus: user?.status || 'offline',
        session: activeSession,
    })
}
