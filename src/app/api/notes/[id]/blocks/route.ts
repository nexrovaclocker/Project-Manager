import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function POST(req: Request, props: { params: Promise<{ id: string }> | { id: string } }) {
    const params = await props.params
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { type, content, text } = await req.json()

    // Get current highest position
    const lastBlock = await prisma.noteBlock.findFirst({
        where: { noteId: params.id },
        orderBy: { position: 'desc' },
    })

    const newPosition = lastBlock ? lastBlock.position + 1 : 0

    if (type === 'text') {
        const block = await prisma.noteBlock.create({
            data: {
                noteId: params.id,
                type: 'text',
                content: content || '',
                position: newPosition,
            },
        })
        return NextResponse.json(block)
    }

    if (type === 'todo') {
        const block = await prisma.noteBlock.create({
            data: {
                noteId: params.id,
                type: 'todo',
                position: newPosition,
                todoItems: {
                    create: {
                        text: text || '',
                    },
                },
            },
            include: { todoItems: true },
        })
        return NextResponse.json(block)
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
}

export async function PUT(req: Request, props: { params: Promise<{ id: string }> | { id: string } }) {
    const params = await props.params
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { blockId, content } = await req.json()

    const block = await prisma.noteBlock.update({
        where: { id: blockId },
        data: {
            content,
        },
    })

    return NextResponse.json(block)
}
