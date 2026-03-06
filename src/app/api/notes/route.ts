import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const notes = await prisma.note.findMany({
        include: {
            creator: { select: { username: true } },
            blocks: {
                include: {
                    todoItems: { include: { checker: { select: { username: true } } } },
                },
                orderBy: { position: 'asc' },
            },
        },
        orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(notes)
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { title } = await req.json()

    if (!title) return NextResponse.json({ error: 'Title required' }, { status: 400 })

    const note = await prisma.note.create({
        data: {
            title,
            createdBy: session.user.id,
        },
        include: {
            creator: { select: { username: true } },
            blocks: { include: { todoItems: true } },
        },
    })

    return NextResponse.json(note)
}
