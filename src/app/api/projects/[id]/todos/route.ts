import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

async function hasProjectAccess(userId: string, role: string, projectId: string) {
    if (role === 'admin' || role === 'member') return true

    // Interns only have access if they are assigned
    const member = await prisma.projectMember.findUnique({
        where: {
            projectId_userId: { projectId, userId }
        }
    })
    return !!member
}

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions)
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: userId, role } = session.user
    const { id: projectId } = await params

    const hasAccess = await hasProjectAccess(userId, role, projectId)
    if (!hasAccess) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const todos = await prisma.projectTodo.findMany({
        where: { projectId },
        include: {
            creator: { select: { id: true, name: true, username: true } },
            checker: { select: { id: true, name: true, username: true } }
        },
        orderBy: { createdAt: 'asc' }
    })

    return NextResponse.json(todos)
}

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions)
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: userId, role } = session.user
    const { id: projectId } = await params

    const hasAccess = await hasProjectAccess(userId, role, projectId)
    if (!hasAccess) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    try {
        const { text } = await req.json()
        if (!text) {
            return NextResponse.json({ error: 'Text is required' }, { status: 400 })
        }

        const todo = await prisma.projectTodo.create({
            data: {
                projectId,
                text,
                createdBy: userId
            },
            include: {
                creator: { select: { id: true, name: true, username: true } },
                checker: { select: { id: true, name: true, username: true } }
            }
        })

        return NextResponse.json(todo)
    } catch (error) {
        console.error('PROJECT_TODO_CREATE_ERROR', error)
        return NextResponse.json({ error: 'Error creating todo' }, { status: 500 })
    }
}
