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
        <div className="flex flex-col h-full w-full bg-transparent text-[var(--color-text-primary)] relative rounded-2xl overflow-hidden glass-panel z-10 transition-all duration-300">
            <div className="absolute top-0 left-0 w-full h-1 bg-[var(--color-brand-accent)] z-20"></div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border-b border-[var(--color-panel-border)]/30 gap-4 bg-[var(--color-panel)] relative">
                {/* Subtle header glow */}
                <div className="absolute -left-10 top-0 w-32 h-10 bg-[var(--color-brand-accent)]/10 blur-2xl rounded-full pointer-events-none"></div>

                <h2 className="text-sm font-bold tracking-widest uppercase flex items-center gap-3 relative z-10">
                    <span className="w-2 h-2 rounded-full bg-[var(--color-brand-accent)] shadow-[0_0_10px_var(--color-brand-accent)]"></span>
                    DAILY_STATS {"//"} 48H_ROLLING_WINDOW
                </h2>

                {isAdmin && (
                    <div className="flex items-center gap-3 relative z-10">
                        <span className="text-[10px] font-bold tracking-widest text-[var(--color-text-secondary)] uppercase bg-[var(--color-panel)] px-3 py-1.5 rounded-l-md border border-[var(--color-panel-border)]/20 border-r-0 h-full flex items-center">TARGET_USER:</span>
                        <div className="relative">
                            <select
                                className="glass-input cursor-pointer appearance-none pr-8 !rounded-l-none text-[11px] font-bold tracking-widest uppercase min-w-[180px]"
                                value={selectedUserId}
                                onChange={(e) => setSelectedUserId(e.target.value)}
                            >
                                {users.map(u => (
                                    <option key={u.id} value={u.id} className="bg-[#1a1a1a] text-white">
                                        {u.username} ({u.role})
                                    </option>
                                ))}
                            </select>
                            <div className="absolute right-3 bottom-0 top-0 flex items-center pointer-events-none">
                                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-custom p-4 relative">
                {/* Decorative ambient background */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-[var(--color-brand-accent)]/5 blur-3xl -z-10 rounded-full pointer-events-none"></div>

                {loading ? (
                    <div className="h-full flex items-center justify-center text-xs tracking-widest text-[var(--color-brand-accent)] uppercase animate-pulse flex-col gap-3">
                        <svg className="w-8 h-8 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        FETCHING_SYS_DATA...
                    </div>
                ) : sessionsData.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-xs tracking-widest text-[var(--color-text-secondary)] uppercase text-center flex-col gap-3">
                        <svg className="w-8 h-8 text-[var(--color-brand-accent)]/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        NO_SESSIONS_RECORDED_IN_LAST_48_HOURS
                    </div>
                ) : (
                    <div className="border border-[var(--color-panel-border)]/20 rounded-xl overflow-hidden bg-black shadow-sm">
                        <table className="w-full text-left text-sm whitespace-nowrap border-collapse relative z-10">
                            <thead className="bg-[var(--color-brand-accent)]/10 border-b border-[var(--color-panel-border)]/20">
                                <tr>
                                    <th className="p-4 text-[10px] font-bold tracking-widest text-[var(--color-brand-accent)] uppercase">STATUS</th>
                                    <th className="p-4 text-[10px] font-bold tracking-widest text-[var(--color-brand-accent)] uppercase">CLOCK_IN</th>
                                    <th className="p-4 text-[10px] font-bold tracking-widest text-[var(--color-brand-accent)] uppercase">CLOCK_OUT</th>
                                    <th className="p-4 text-[10px] font-bold tracking-widest text-[var(--color-brand-accent)] uppercase text-right">DURATION</th>
                                    <th className="p-4 text-[10px] font-bold tracking-widest text-[var(--color-brand-accent)] uppercase w-full">NOTES</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sessionsData.map((session) => {
                                    const isMidnightCross = crossesMidnight(session.clockIn, session.clockOut)

                                    return (
                                        <tr
                                            key={session.id}
                                            className={`border-b border-[var(--color-panel-border)]/10 last:border-b-0 transition-colors hover:bg-black/5 group/row ${isMidnightCross ? 'bg-red-500/10' : ''}`}
                                        >
                                            <td className="p-4">
                                                {session.clockOut ? (
                                                    <span className="text-[10px] font-bold tracking-widest text-blue-400 uppercase flex items-center gap-2 drop-shadow-md">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_5px_#3b82f6]"></span>LOGGED
                                                    </span>
                                                ) : (
                                                    <span className="text-[10px] font-bold tracking-widest text-[var(--color-brand-accent)] uppercase flex items-center gap-2 animate-pulse drop-shadow-md">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-brand-accent)] shadow-[0_0_8px_var(--color-brand-accent)]"></span>ACTIVE
                                                    </span>
                                                )}
                                                {isMidnightCross && (
                                                    <div className="text-[8px] font-bold tracking-widest text-red-400 mt-2 uppercase bg-red-500/10 inline-block px-1.5 py-0.5 rounded border border-red-500/20">MIDNIGHT_CROSS</div>
                                                )}
                                            </td>
                                            <td className="p-4 text-xs font-mono text-[var(--color-text-primary)] group-hover/row:text-[var(--color-brand-accent)] transition-colors">
                                                {new Date(session.clockIn).toLocaleString()}
                                            </td>
                                            <td className="p-4 text-xs font-mono text-[var(--color-text-primary)] group-hover/row:text-[var(--color-brand-accent)] transition-colors">
                                                {session.clockOut ? new Date(session.clockOut).toLocaleString() : <span className="text-[var(--color-text-secondary)]">--</span>}
                                            </td>
                                            <td className="p-4 text-xs font-mono text-right font-bold text-[var(--color-brand-accent)]">
                                                {session.durationMinutes !== null ? (
                                                    <div className="bg-[var(--color-brand-accent)]/10 inline-block px-2 py-1 rounded-md border border-[var(--color-brand-accent)]/20 shadow-sm max-w-max ml-auto">
                                                        {session.durationMinutes} MIN
                                                    </div>
                                                ) : <span className="text-[var(--color-text-secondary)]">--</span>}
                                            </td>
                                            <td className="p-4 text-xs text-[var(--color-text-secondary)] truncate max-w-xs group-hover/row:text-[var(--color-text-primary)] transition-colors">
                                                {session.sessionNote || <span className="italic opacity-50">NO_NOTES_PROVIDED</span>}
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
