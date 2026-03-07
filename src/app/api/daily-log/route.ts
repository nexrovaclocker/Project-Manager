import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
    const session = await getServerSession(authOptions)
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const whereClause = session.user.role === 'admin' ? {} : { userId: session.user.id }

    const logs = await prisma.dailyLog.findMany({
        where: whereClause,
        include: {
            user: { select: { id: true, name: true, username: true, role: true } }
        },
        orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(logs)
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const { content } = await req.json()
        if (!content) {
            return NextResponse.json({ error: 'Content is required' }, { status: 400 })
        }

        const log = await prisma.dailyLog.create({
            data: {
                content,
                userId: session.user.id
            },
            include: {
                user: { select: { id: true, name: true, username: true, role: true } }
            }
        })

        return NextResponse.json(log)
    } catch (error) {
        console.error('DAILY_LOG_CREATE_ERROR', error)
        return NextResponse.json({ error: 'Error creating daily log' }, { status: 500 })
    }
}
