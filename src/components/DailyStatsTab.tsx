'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type User = { id: string; name: string; username: string; role: string; status?: string; last_seen?: string }
type ClockSession = { id: string; userId: string; clockIn: string; clockOut: string | null; durationMinutes: number; date: string; User?: User }

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function getWeekDates(): string[] {
    const result = []
    for (let i = 6; i >= 0; i--) {
        const d = new Date()
        d.setDate(d.getDate() - i)
        result.push(d.toISOString().slice(0, 10))
    }
    return result
}

function downloadCSV(sessions: ClockSession[]) {
    const header = 'Date,User,Clock In,Clock Out,Minutes'
    const rows = sessions.map(s =>
        [s.date, s.User?.name ?? s.userId, s.clockIn, s.clockOut ?? '', s.durationMinutes ?? ''].join(',')
    )
    const csv = [header, ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `nexrova_sessions_${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
}

export function DailyStatsTab() {
    const [sessions, setSessions] = useState<ClockSession[]>([])
    const [users, setUsers] = useState<User[]>([])
    const weekDates = getWeekDates()
    const today = new Date().toISOString().slice(0, 10)

    useEffect(() => {
        const load = async () => {
            const [{ data: s }, { data: u }] = await Promise.all([
                supabase.from('ClockSession').select('*, User(name, id)').order('clockIn', { ascending: false }),
                supabase.from('User').select('id, name, username, role, status, last_seen'),
            ])
            if (s) setSessions(s)
            if (u) setUsers(u)
        }
        load()

        const sub = supabase.channel('daily_stats_users')
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'User' }, (payload) => {
                setUsers(prev => prev.map(u => u.id === payload.new.id ? (payload.new as any) : u))
            })
            .subscribe()

        return () => { supabase.removeChannel(sub) }
    }, [])

    const weekSessions = sessions.filter(s => weekDates.includes(s.date ?? s.clockIn?.slice(0, 10)))

    // 7-day grid grouped by date
    const gridData = weekDates.map(date => {
        const daySessions = weekSessions.filter(s => (s.date ?? s.clockIn?.slice(0, 10)) === date)
        const totalMins = daySessions.reduce((a, s) => a + (s.durationMinutes ?? 0), 0)
        return { date, totalHours: (totalMins / 60).toFixed(1), count: daySessions.length, isToday: date === today }
    })

    // Hours per user this week (horizontal bars)
    const perUser = users.map(u => {
        const mins = weekSessions.filter(s => s.userId === u.id).reduce((a, s) => a + (s.durationMinutes ?? 0), 0)
        return { name: u.name ?? u.username, hours: mins / 60 }
    }).filter(u => u.hours > 0).sort((a, b) => b.hours - a.hours)
    const maxHours = Math.max(...perUser.map(u => u.hours), 1)

    // Online & Offline lists
    const onlineUsers = users.filter(u => u.status === 'online' || u.status === 'break')
    const offlineUsers = users.filter(u => u.status === 'offline' || !u.status)

    return (
        <div className="flex flex-col gap-6">

            {/* Top row: header + export button */}
            <div className="flex items-center justify-between">
                <span style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 20, color: '#ffffff' }}>DAILY STATS</span>
                <button className="glass-button text-[10px]" onClick={() => downloadCSV(weekSessions)}>
                    EXPORT CSV
                </button>
            </div>

            {/* 7-day grid */}
            <div className="grid grid-cols-7 gap-2">
                {gridData.map(d => (
                    <div key={d.date} className="glass-panel p-3 flex flex-col gap-1 items-center" style={{
                        borderColor: d.isToday ? '#f9731650' : undefined,
                        background: d.isToday ? '#f9731608' : undefined
                    }}>
                        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: d.isToday ? '#f97316' : '#a3a3a3', letterSpacing: '1px', textTransform: 'uppercase' }}>
                            {DAYS[new Date(d.date + 'T12:00:00').getDay()]}
                        </span>
                        <span style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 20, color: d.isToday ? '#f97316' : '#ffffff' }}>
                            {d.totalHours}h
                        </span>
                        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: '#555555' }}>
                            {d.count} session{d.count !== 1 ? 's' : ''}
                        </span>
                    </div>
                ))}
            </div>

            {/* 2-card row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

                {/* Hours per user – horizontal bars */}
                <div className="glass-panel p-5 flex flex-col gap-4">
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: '#a3a3a3', letterSpacing: '1.5px', textTransform: 'uppercase' }}>HOURS PER MEMBER — THIS WEEK</div>
                    <div className="flex flex-col gap-3">
                        {perUser.map((u, i) => (
                            <div key={i} className="flex flex-col gap-1">
                                <div className="flex justify-between">
                                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: '#e5e5e5' }}>{u.name}</span>
                                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: '#f97316' }}>{u.hours.toFixed(1)}h</span>
                                </div>
                                <div style={{ height: 4, background: '#111111', borderRadius: 2, overflow: 'hidden' }}>
                                    <div style={{ height: '100%', width: `${(u.hours / maxHours) * 100}%`, background: '#f97316', borderRadius: 2, transition: 'width 0.5s' }} />
                                </div>
                            </div>
                        ))}
                        {perUser.length === 0 && (
                            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: '#333333', textAlign: 'center', padding: '16px 0' }}>NO_DATA_THIS_WEEK</div>
                        )}
                    </div>
                </div>

                {/* Presence Lists */}
                <div className="glass-panel p-5 flex flex-col gap-6">
                    {/* Currently Online */}
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#f97316] animate-orange-pulse"></span>
                            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: '#a3a3a3', letterSpacing: '1.5px', textTransform: 'uppercase' }}>CURRENTLY ONLINE</span>
                        </div>
                        <div className="flex flex-col gap-3">
                            {onlineUsers.map(u => {
                                const openSession = sessions.find(s => s.userId === u.id && !s.clockOut)
                                const dotColor = u.status === 'online' ? '#f97316' : '#fb923c'
                                return (
                                    <div key={u.id} className="flex items-center justify-between border-b border-[#ffffff08] pb-2">
                                        <div className="flex items-center gap-3">
                                            <span className={u.status === 'online' ? 'animate-orange-pulse' : ''} style={{ width: 8, height: 8, borderRadius: '50%', background: dotColor }}></span>
                                            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: '#e5e5e5' }}>{u.name || u.username}</span>
                                        </div>
                                        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: '#a3a3a3' }}>
                                            IN: {openSession ? new Date(openSession.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '---'}
                                        </span>
                                    </div>
                                )
                            })}
                            {onlineUsers.length === 0 && (
                                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: '#333333', textAlign: 'center', padding: '8px 0' }}>NO_USERS_ONLINE</div>
                            )}
                        </div>
                    </div>

                    {/* Currently Offline */}
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#555555]"></span>
                            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: '#a3a3a3', letterSpacing: '1.5px', textTransform: 'uppercase' }}>CURRENTLY OFFLINE</span>
                        </div>
                        <div className="flex flex-col gap-3">
                            {offlineUsers.map(u => (
                                <div key={u.id} className="flex items-center justify-between border-b border-[#ffffff08] pb-2">
                                    <div className="flex items-center gap-3">
                                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#555555' }}></span>
                                        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: '#e5e5e5' }}>{u.name || u.username}</span>
                                    </div>
                                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: '#555555' }}>
                                        Last seen: {u.last_seen ? new Date(u.last_seen).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Never'}
                                    </span>
                                </div>
                            ))}
                            {offlineUsers.length === 0 && (
                                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: '#333333', textAlign: 'center', padding: '8px 0' }}>NO_USERS_OFFLINE</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
