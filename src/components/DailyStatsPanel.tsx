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
        <div className="flex flex-col h-full w-full bg-transparent text-white relative rounded-2xl overflow-hidden glass-panel z-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 border-b border-[#f97316]/20 gap-4 bg-[#1E1E2E] relative">
                <h2 className="text-sm font-bold tracking-[0.2em] uppercase flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-[#f97316] shadow-[0_0_10px_#f97316]"></span>
                    Performance_Analytics
                </h2>

                {isAdmin && (
                    <div className="flex items-center gap-3">
                        <span className="text-[10px] font-bold tracking-widest text-[#94A3B8] uppercase">Target_Data:</span>
                        <div className="relative">
                            <select
                                className="glass-input !py-1.5 !px-3 text-[11px] font-bold tracking-widest uppercase min-w-[160px]"
                                value={selectedUserId}
                                onChange={(e) => setSelectedUserId(e.target.value)}
                            >
                                {users.map(u => (
                                    <option key={u.id} value={u.id} className="bg-[#1E1E2E] text-white">
                                        {u.username}
                                    </option>
                                )) || <option value="">Loading...</option>}
                            </select>
                        </div>
                    </div>
                )}
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-custom p-6">
                {loading ? (
                    <div className="h-full flex items-center justify-center text-[10px] tracking-widest text-[#f97316] uppercase animate-pulse">
                        Synchronizing_Data...
                    </div>
                ) : sessionsData.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-[10px] tracking-widest text-[#94A3B8] uppercase text-center border border-dashed border-[#f97316]/20 rounded-2xl">
                        Null_Data_Retrieved_48H
                    </div>
                ) : (
                    <div className="border border-[#f97316]/20 rounded-xl overflow-hidden bg-[#1E1E2E]/40 backdrop-blur-md">
                        <table className="w-full text-left text-xs whitespace-nowrap">
                            <thead className="bg-[#f97316]/10 border-b border-[#f97316]/20">
                                <tr>
                                    <th className="p-4 font-bold tracking-widest text-[#f97316] uppercase">Status</th>
                                    <th className="p-4 font-bold tracking-widest text-[#f97316] uppercase">Entry</th>
                                    <th className="p-4 font-bold tracking-widest text-[#f97316] uppercase">Exit</th>
                                    <th className="p-4 font-bold tracking-widest text-[#f97316] uppercase text-right">Duration</th>
                                    <th className="p-4 font-bold tracking-widest text-[#f97316] uppercase">Reports</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#f97316]/5">
                                {sessionsData.map((session) => {
                                    const isMidnightCross = crossesMidnight(session.clockIn, session.clockOut)

                                    return (
                                        <tr key={session.id} className={`transition-colors hover:bg-white/5 ${isMidnightCross ? 'bg-red-500/5' : ''}`}>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <span className={`w-1.5 h-1.5 rounded-full ${session.clockOut ? 'bg-[#94A3B8]' : 'bg-[#f97316] shadow-[0_0_8px_#f97316] animate-pulse'}`}></span>
                                                    <span className={`text-[10px] font-bold tracking-widest ${session.clockOut ? 'text-[#94A3B8]' : 'text-[#f97316]'} uppercase`}>
                                                        {session.clockOut ? 'Archive' : 'Active'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="p-4 text-[#94A3B8]">
                                                {new Date(session.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                <span className="block text-[8px] opacity-40">{new Date(session.clockIn).toLocaleDateString()}</span>
                                            </td>
                                            <td className="p-4 text-[#94A3B8]">
                                                {session.clockOut ? (
                                                    <>
                                                        {new Date(session.clockOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        <span className="block text-[8px] opacity-40">{new Date(session.clockOut).toLocaleDateString()}</span>
                                                    </>
                                                ) : '--:--'}
                                            </td>
                                            <td className="p-4 text-right">
                                                <span className="px-2 py-1 rounded bg-[#f97316]/10 border border-[#f97316]/20 text-[#f97316] font-bold">
                                                    {session.durationMinutes !== null ? `${session.durationMinutes}m` : '---'}
                                                </span>
                                            </td>
                                            <td className="p-4 text-[#94A3B8] max-w-xs truncate italic">
                                                {session.sessionNote || 'no_log'}
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
