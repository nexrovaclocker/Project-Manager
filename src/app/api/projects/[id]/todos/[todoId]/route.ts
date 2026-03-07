import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

async function hasProjectAccess(userId: string, role: string, projectId: string) {
    if (role === 'admin' || role === 'member') return true

    const member = await prisma.projectMember.findUnique({
        where: {
            projectId_userId: { projectId, userId }
        }
    })
    return !!member
}

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string, todoId: string }> }
) {
    const session = await getServerSession(authOptions)
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: userId, role } = session.user
    const { id: projectId, todoId } = await params

    const hasAccess = await hasProjectAccess(userId, role, projectId)
    if (!hasAccess) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    try {
        const { checked } = await req.json()

        const todo = await prisma.projectTodo.update({
            where: { id: todoId, projectId },
            data: {
                checked,
                checkedBy: checked ? userId : null
            },
            include: {
                creator: { select: { id: true, name: true, username: true } },
                checker: { select: { id: true, name: true, username: true } }
            }
        })

        return NextResponse.json(todo)
    } catch (error) {
        console.error('PROJECT_TODO_UPDATE_ERROR', error)
        return NextResponse.json({ error: 'Error updating todo' }, { status: 500 })
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string, todoId: string }> }
) {
    const session = await getServerSession(authOptions)
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: userId, role } = session.user
    const { id: projectId, todoId } = await params

    const hasAccess = await hasProjectAccess(userId, role, projectId)
    if (!hasAccess) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    try {
        await prisma.projectTodo.delete({
            where: { id: todoId, projectId }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('PROJECT_TODO_DELETE_ERROR', error)
        return NextResponse.json({ error: 'Error deleting todo' }, { status: 500 })
    }
}
