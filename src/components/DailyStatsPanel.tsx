'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

type User = {
    id: string
    name: string
    username: string
    role: string
}

type TimeLog = {
    id: string
    userId: string
    clockIn: string
    clockOut: string | null
    durationMinutes: number | null
    sessionNote: string | null
    user: User
}

export function DailyStatsPanel() {
    const { data: session } = useSession()
    const isAdmin = session?.user?.role === 'admin'

    const [users, setUsers] = useState<User[]>([])
    const [selectedUserId, setSelectedUserId] = useState<string>('')
    const [sessionsData, setSessionsData] = useState<TimeLog[]>([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (isAdmin) {
            fetchUsers()
        }
    }, [isAdmin])

    useEffect(() => {
        // If it's an admin, wait until they select someone (or default to themselves if we want, but letting them select is better)
        // Actually, let's default to the current user's stats first
        if (!isAdmin) {
            fetchStats(session?.user?.id || '')
        } else if (selectedUserId) {
            fetchStats(selectedUserId)
        } else if (session?.user?.id) {
            setSelectedUserId(session.user.id)
            fetchStats(session.user.id)
        }
    }, [isAdmin, selectedUserId, session])

    const fetchUsers = async () => {
        const res = await fetch('/api/users')
        if (res.ok) {
            const data = await res.json()
            setUsers(data)
        }
    }

    const fetchStats = async (userId: string) => {
        if (!userId) return
        setLoading(true)
        const res = await fetch(`/api/stats?userId=${userId}`, { cache: 'no-store' })
        if (res.ok) {
            const data = await res.json()
            setSessionsData(data)
        }
        setLoading(false)
    }

    const crossesMidnight = (clockIn: string, clockOut: string | null) => {
        if (!Math || !clockOut) return false
        const inDate = new Date(clockIn)
        const outDate = new Date(clockOut)
        // Check if day/month/year differs
        return inDate.getDate() !== outDate.getDate() ||
            inDate.getMonth() !== outDate.getMonth() ||
            inDate.getFullYear() !== outDate.getFullYear()
    }

    return (
        <div className="flex flex-col h-full w-full bg-[var(--color-bg-dark)] text-[var(--color-text-primary)] relative border border-[var(--color-panel-border)] overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-[var(--color-green-accent)]"></div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border-b border-[var(--color-panel-border)] gap-4">
                <h2 className="text-sm font-bold tracking-widest uppercase flex items-center gap-2">
                    <span className="w-2 h-2 bg-[var(--color-green-accent)]"></span>
                    DAILY_STATS {"//"} 48H_ROLLING_WINDOW
                </h2>

                {isAdmin && (
                    <div className="flex items-center gap-3">
                        <span className="text-[10px] font-bold tracking-widest text-[var(--color-text-secondary)] uppercase">TARGET_USER:</span>
                        <select
                            className="bg-[var(--color-panel)] border border-[var(--color-panel-border)] p-1.5 text-xs focus:border-[var(--color-green-accent)] focus:outline-none text-[var(--color-text-primary)] uppercase min-w-[150px]"
                            value={selectedUserId}
                            onChange={(e) => setSelectedUserId(e.target.value)}
                        >
                            {users.map(u => (
                                <option key={u.id} value={u.id}>
                                    {u.username} ({u.role})
                                </option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-custom p-4">
                {loading ? (
                    <div className="text-xs tracking-widest text-[var(--color-text-secondary)] uppercase animate-pulse">
                        FETCHING_DATA...
                    </div>
                ) : sessionsData.length === 0 ? (
                    <div className="text-xs tracking-widest text-[var(--color-text-secondary)] uppercase">
                        NO_SESSIONS_RECORDED_IN_LAST_48_HOURS
                    </div>
                ) : (
                    <div className="border border-[var(--color-panel-border)] w-full overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-[var(--color-panel)] border-b border-[var(--color-panel-border)]">
                                <tr>
                                    <th className="p-3 text-[10px] font-bold tracking-widest text-[var(--color-text-secondary)] uppercase">STATUS</th>
                                    <th className="p-3 text-[10px] font-bold tracking-widest text-[var(--color-text-secondary)] uppercase">CLOCK_IN</th>
                                    <th className="p-3 text-[10px] font-bold tracking-widest text-[var(--color-text-secondary)] uppercase">CLOCK_OUT</th>
                                    <th className="p-3 text-[10px] font-bold tracking-widest text-[var(--color-text-secondary)] uppercase text-right">DURATION</th>
                                    <th className="p-3 text-[10px] font-bold tracking-widest text-[var(--color-text-secondary)] uppercase w-full">NOTES</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sessionsData.map((session) => {
                                    const isMidnightCross = crossesMidnight(session.clockIn, session.clockOut)

                                    return (
                                        <tr
                                            key={session.id}
                                            className={`border-b border-[var(--color-panel-border)] last:border-b-0 transition-colors hover:bg-[var(--color-panel)] ${isMidnightCross ? 'bg-red-900/10' : ''}`}
                                        >
                                            <td className="p-3">
                                                {session.clockOut ? (
                                                    <span className="text-[10px] font-bold tracking-widest text-blue-500 uppercase flex items-center gap-1">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>LOGGED
                                                    </span>
                                                ) : (
                                                    <span className="text-[10px] font-bold tracking-widest text-[var(--color-green-accent)] uppercase flex items-center gap-1 animate-pulse">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-green-accent)]"></span>ACTIVE
                                                    </span>
                                                )}
                                                {isMidnightCross && (
                                                    <div className="text-[8px] font-bold tracking-widest text-red-500 mt-1 uppercase">MIDNIGHT_CROSS</div>
                                                )}
                                            </td>
                                            <td className="p-3 text-xs font-mono text-[var(--color-text-primary)]">
                                                {new Date(session.clockIn).toLocaleString()}
                                            </td>
                                            <td className="p-3 text-xs font-mono text-[var(--color-text-primary)]">
                                                {session.clockOut ? new Date(session.clockOut).toLocaleString() : '--'}
                                            </td>
                                            <td className="p-3 text-xs font-mono text-right font-bold text-[var(--color-green-accent)]">
                                                {session.durationMinutes !== null ? `${session.durationMinutes} MIN` : '--'}
                                            </td>
                                            <td className="p-3 text-xs text-[var(--color-text-secondary)] truncate max-w-xs">
                                                {session.sessionNote || '--'}
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}
