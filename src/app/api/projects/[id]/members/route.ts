import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const { userId } = await req.json()
        if (!userId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
        }

        const { id: projectId } = await params

        const projectMember = await prisma.projectMember.create({
            data: {
                projectId,
                userId
            },
            include: {
                user: { select: { id: true, name: true, username: true, role: true } }
            }
        })

        return NextResponse.json(projectMember)
    } catch (error) {
        console.error('PROJECT_MEMBER_ADD_ERROR', error)
        return NextResponse.json({ error: 'Error adding member' }, { status: 500 })
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const url = new URL(req.url)
        const userId = url.searchParams.get('userId')

        if (!userId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
        }

        const { id: projectId } = await params

        await prisma.projectMember.delete({
            where: {
                projectId_userId: {
                    projectId,
                    userId
                }
            }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('PROJECT_MEMBER_REMOVE_ERROR', error)
        return NextResponse.json({ error: 'Error removing member' }, { status: 500 })
    }
}
