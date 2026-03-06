import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function DELETE(req: Request, props: { params: Promise<{ id: string }> | { id: string } }) {
    const params = await props.params
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const note = await prisma.note.findUnique({ where: { id: params.id } })
    if (!note) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    if (note.createdBy !== session.user.id && session.user.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await prisma.note.delete({ where: { id: params.id } })

    return NextResponse.json({ success: true })
}
