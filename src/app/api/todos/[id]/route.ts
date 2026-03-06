import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function PUT(req: Request, props: { params: Promise<{ id: string }> | { id: string } }) {
    const params = await props.params
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { checked } = await req.json()

    const todo = await prisma.todoItem.update({
        where: { id: params.id },
        data: {
            checked,
            checkedBy: checked ? session.user.id : null,
        },
        include: {
            checker: { select: { username: true } },
        },
    })

    return NextResponse.json(todo)
}
