import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request, props: { params: Promise<{ userId: string }> | { userId: string } }) {
    const params = await props.params
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get date 7 days ago
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    sevenDaysAgo.setHours(0, 0, 0, 0)

    const sessions = await prisma.clockSession.findMany({
        where: {
            userId: params.userId,
            clockIn: {
                gte: sevenDaysAgo,
            },
            clockOut: {
                not: null,
            },
        },
        orderBy: {
            clockIn: 'asc',
        },
    })

    // Calculate totals and group by day
    let totalMinutes = 0
    const dailyData: Record<string, number> = {}

    sessions.forEach((s: any) => {
        if (s.durationMinutes) {
            totalMinutes += s.durationMinutes
            const day = s.clockIn.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
            if (!dailyData[day]) dailyData[day] = 0
            dailyData[day] += s.durationMinutes / 60 // convert to hours for chart
        }
    })

    const dailyChartData = Object.entries(dailyData).map(([date, hours]) => ({
        date,
        hours: Number(hours.toFixed(2)),
    }))

    const sessionChartData = sessions.map((s: any, idx: number) => ({
        name: `Session ${idx + 1}`,
        duration: s.durationMinutes ? Number((s.durationMinutes / 60).toFixed(2)) : 0,
        note: s.sessionNote || 'No note',
    }))

    return NextResponse.json({
        sessions,
        totalHours: Math.floor(totalMinutes / 60),
        totalMinutes: totalMinutes % 60,
        dailyChartData,
        sessionChartData,
    })
}
