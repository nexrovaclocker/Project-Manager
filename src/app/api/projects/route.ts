import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
    const session = await getServerSession(authOptions)
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { role, id: userId } = session.user

    let projects
    if (role === 'intern') {
        projects = await prisma.project.findMany({
            where: {
                members: {
                    some: { userId: userId }
                }
            },
            include: {
                members: {
                    include: {
                        user: {
                            select: { id: true, name: true, username: true, role: true }
                        }
                    }
                },
                todos: {
                    include: {
                        creator: { select: { id: true, name: true, username: true } },
                        checker: { select: { id: true, name: true, username: true } }
                    },
                    orderBy: { createdAt: 'asc' }
                }
            },
            orderBy: { createdAt: 'desc' }
        })
    } else {
        projects = await prisma.project.findMany({
            include: {
                members: {
                    include: {
                        user: {
                            select: { id: true, name: true, username: true, role: true }
                        }
                    }
                },
                todos: {
                    include: {
                        creator: { select: { id: true, name: true, username: true } },
                        checker: { select: { id: true, name: true, username: true } }
                    },
                    orderBy: { createdAt: 'asc' }
                }
            },
            orderBy: { createdAt: 'desc' }
        })
    }

    return NextResponse.json(projects)
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const { name, description } = await req.json()

        if (!name) {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 })
        }

        const project = await prisma.project.create({
            data: {
                name,
                description: description || '',
                createdBy: session.user.id,
            },
            include: {
                members: {
                    include: {
                        user: {
                            select: { id: true, name: true, username: true, role: true }
                        }
                    }
                }
            }
        })

        return NextResponse.json(project)
    } catch (error) {
        console.error('PROJECT_CREATE_ERROR', error)
        return NextResponse.json({ error: 'Error creating project' }, { status: 500 })
    }
}
