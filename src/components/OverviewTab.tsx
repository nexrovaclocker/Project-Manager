'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { BarChart, Bar, XAxis, ResponsiveContainer, Cell } from 'recharts'
import { ClockPanel } from '@/components/ClockPanel'
import { NotesPanel } from '@/components/NotesPanel'

type User = { id: string; name: string; username: string; status: string; current_task: string; last_seen: string }
type Project = { id: string; name: string; status: string; progressPercent: number; tasksDone: number; tasksTotal: number }
type EventLog = { id: string; userId: string; eventType: string; detail: string; timestamp: string; User?: User }
type ClockSession = { id: string; userId: string; durationMinutes: number; clockIn: string; clockOut: string | null; date: string }

const BADGE_COLOR: Record<string, { bg: string; text: string; border: string }> = {
    CLOCK_IN: { bg: '#f9731615', text: '#f97316', border: '#f9731630' },
    BRK_END: { bg: '#f9731615', text: '#f97316', border: '#f9731630' },
    CLOCK_OUT: { bg: '#ffffff15', text: '#ffffff', border: '#ffffff30' },
    ON_BREAK: { bg: '#fb923c15', text: '#fb923c', border: '#fb923c30' },
    ASSIGNED: { bg: '#e5e5e515', text: '#e5e5e5', border: '#e5e5e530' },
}

const STATUS_DOT: Record<string, string> = {
    online: '#f97316',
    break: '#fb923c',
    offline: '#555555',
}

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function initials(name: string) {
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

function StatCard({ label, value }: { label: string; value: string | number }) {
    return (
        <div className="glass-panel p-5 flex flex-col gap-2 flex-1">
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: '#a3a3a3', letterSpacing: '1.5px', textTransform: 'uppercase' }}>{label}</div>
            <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 36, fontWeight: 700, color: '#ffffff', lineHeight: 1 }}>{value}</div>
        </div>
    )
}

export function OverviewTab() {
    const [users, setUsers] = useState<User[]>([])
    const [projects, setProjects] = useState<Project[]>([])
    const [events, setEvents] = useState<EventLog[]>([])
    const [sessions, setSessions] = useState<ClockSession[]>([])
    const [weekData, setWeekData] = useState<{ day: string; hours: number; isToday: boolean }[]>([])

    const today = new Date().toISOString().slice(0, 10)
    const todayDay = new Date().getDay()

    useEffect(() => {
        const loadAll = async () => {
            const [{ data: u }, { data: p }, { data: s }] = await Promise.all([
                supabase.from('User').select('*'),
                supabase.from('Project').select('*'),
                supabase.from('ClockSession').select('*'),
            ])
            if (u) setUsers(u)
            if (p) setProjects(p)
            if (s) {
                setSessions(s)
                // Build 7-day bar chart data
                const grouped: Record<string, number> = {}
                s.filter((ss: ClockSession) => {
                    const d = new Date(ss.clockIn)
                    const diff = Math.floor((new Date().getTime() - d.getTime()) / 86400000)
                    return diff < 7
                }).forEach((ss: ClockSession) => {
                    const d = new Date(ss.clockIn).getDay()
                    grouped[d] = (grouped[d] ?? 0) + (ss.durationMinutes ?? 0)
                })
                const days = Array.from({ length: 7 }, (_, i) => {
                    const dayIndex = (todayDay - 6 + i + 7) % 7
                    return {
                        day: DAY_NAMES[dayIndex],
                        hours: Math.round((grouped[dayIndex] ?? 0) / 60 * 10) / 10,
                        isToday: dayIndex === todayDay,
                    }
                })
                setWeekData(days)
            }
        }
        loadAll()

        // Load event log with joined user names  
        const loadEvents = async () => {
            const { data } = await supabase.from('EventLog').select('*, User(name)').order('timestamp', { ascending: false }).limit(20)
            if (data) setEvents(data)
        }
        loadEvents()

        // Realtime: EventLog
        const evSub = supabase.channel('overview_eventlog')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'EventLog' }, () => loadEvents())
            .subscribe()

        // Realtime: Users
        const userSub = supabase.channel('overview_users')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'User' }, async () => {
                const { data } = await supabase.from('User').select('*')
                if (data) setUsers(data)
            })
            .subscribe()

        return () => {
            supabase.removeChannel(evSub)
            supabase.removeChannel(userSub)
        }
    }, [])

    const onlineUsers = users.filter(u => u.status === 'online')
    const todayMinutes = sessions.filter(s => s.date === today || s.clockIn?.startsWith(today)).reduce((a, s) => a + (s.durationMinutes ?? 0), 0)
    const activeTasks = projects.reduce((a, p) => a + Math.max(0, (p.tasksTotal ?? 0) - (p.tasksDone ?? 0)), 0)
    const velocity = projects.length > 0 ? Math.round(projects.reduce((a, p) => {
        if (!p.tasksTotal) return a
        return a + (p.tasksDone / p.tasksTotal) * 100
    }, 0) / projects.length) : 0

    return (
        <div className="flex flex-col gap-6">
            {/* Clock + Notes Row — always available to all roles */}
            <div className="flex flex-col lg:flex-row gap-4">
                <div className="w-full lg:w-1/3 glass-panel relative overflow-hidden" style={{ minHeight: 280 }}>
                    <div className="absolute top-0 left-0 w-full h-1 bg-[#f97316] shadow-[0_0_10px_#f97316] z-20"></div>
                    <ClockPanel />
                </div>
                <div className="w-full lg:w-2/3 glass-panel relative overflow-hidden" style={{ minHeight: 280 }}>
                    <div className="absolute top-0 left-0 w-full h-1 bg-[#f97316] shadow-[0_0_10px_#f97316] z-20"></div>
                    <NotesPanel />
                </div>
            </div>
            {/* Section 1 — Stat Cards */}
            <div className="flex gap-4 flex-wrap">
                <StatCard label="Online Now" value={onlineUsers.length} />
                <StatCard label="Team Hours Today" value={(todayMinutes / 60).toFixed(1) + 'h'} />
                <StatCard label="Tasks Active" value={activeTasks} />
                <StatCard label="Sprint Velocity" value={velocity + '%'} />
            </div>

            {/* Section 2 — Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Clock-In Bar Chart */}
                <div className="glass-panel p-5">
                    <div className="text-[10px] tracking-[1.5px] uppercase mb-4" style={{ color: '#a3a3a3', fontFamily: "'JetBrains Mono', monospace" }}>CLOCK-IN ACTIVITY — THIS WEEK</div>
                    <ResponsiveContainer width="100%" height={140}>
                        <BarChart data={weekData} barSize={20}>
                            <XAxis dataKey="day" tick={{ fill: '#a3a3a3', fontSize: 10, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
                            <Bar dataKey="hours" radius={[2, 2, 0, 0]}>
                                {weekData.map((entry, i) => (
                                    <Cell key={i} fill={entry.isToday ? '#f97316' : '#111111'} stroke={entry.isToday ? '#f97316' : '#f9731640'} strokeWidth={1} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Project Progress */}
                <div className="glass-panel p-5 flex flex-col gap-3">
                    <div className="text-[10px] tracking-[1.5px] uppercase mb-2" style={{ color: '#a3a3a3', fontFamily: "'JetBrains Mono', monospace" }}>PROJECT PROGRESS</div>
                    <div className="flex flex-col gap-3 overflow-y-auto max-h-[160px] scrollbar-custom pr-1">
                        {projects.map(p => (
                            <div key={p.id} className="flex flex-col gap-1">
                                <div className="flex justify-between">
                                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: '#e5e5e5' }}>{p.name}</span>
                                    <span style={{
                                        fontSize: 9, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '1px', textTransform: 'uppercase',
                                        color: p.status === 'at-risk' ? '#fb923c' : '#f97316',
                                        background: p.status === 'at-risk' ? '#fb923c15' : '#f9731615',
                                        border: `1px solid ${p.status === 'at-risk' ? '#fb923c30' : '#f9731630'}`,
                                        padding: '1px 6px', borderRadius: 4
                                    }}>{p.status ?? 'ACTIVE'}</span>
                                </div>
                                <div style={{ height: 4, background: '#111111', borderRadius: 2, overflow: 'hidden' }}>
                                    <div style={{ height: '100%', width: `${p.progressPercent ?? 0}%`, background: '#f97316', borderRadius: 2 }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Section 3 — Live Log + Quick Presence */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Live Clock Log */}
                <div className="glass-panel p-5 flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#f97316] animate-orange-pulse"></span>
                        <span className="text-[10px] tracking-[1.5px] uppercase" style={{ color: '#a3a3a3', fontFamily: "'JetBrains Mono', monospace" }}>LIVE CLOCK LOG</span>
                    </div>
                    <div className="flex flex-col gap-2 overflow-y-auto max-h-[240px] scrollbar-custom pr-1">
                        {events.map(ev => {
                            const bc = BADGE_COLOR[ev.eventType] ?? BADGE_COLOR['ASSIGNED']
                            return (
                                <div key={ev.id} className="flex items-start gap-3 text-[10px] border-b border-[#ffffff08] pb-2">
                                    <span style={{ color: '#555555', fontFamily: "'JetBrains Mono', monospace", whiteSpace: 'nowrap' }}>
                                        {new Date(ev.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                    <span style={{ background: bc.bg, color: bc.text, border: `1px solid ${bc.border}`, borderRadius: 4, padding: '0 6px', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '1px', whiteSpace: 'nowrap' }}>
                                        {ev.eventType}
                                    </span>
                                    <span style={{ color: '#e5e5e5', fontFamily: "'JetBrains Mono', monospace" }}>{(ev as any).User?.name ?? ''}</span>
                                    <span style={{ color: '#a3a3a3', fontFamily: "'JetBrains Mono', monospace", whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ev.detail}</span>
                                </div>
                            )
                        })}
                        {events.length === 0 && (
                            <div style={{ color: '#555555', fontFamily: "'JetBrains Mono', monospace", fontSize: 10, textAlign: 'center', padding: '16px 0' }}>AWAITING_EVENTS...</div>
                        )}
                    </div>
                </div>

                {/* Quick Presence */}
                <div className="glass-panel p-5 flex flex-col gap-3">
                    <div className="text-[10px] tracking-[1.5px] uppercase mb-1" style={{ color: '#a3a3a3', fontFamily: "'JetBrains Mono', monospace" }}>QUICK PRESENCE</div>
                    <div className="flex flex-col gap-3 overflow-y-auto max-h-[240px] scrollbar-custom pr-1">
                        {users.map(u => {
                            const dotColor = STATUS_DOT[u.status] ?? '#555555'
                            return (
                                <div key={u.id} className="flex items-center gap-3">
                                    <div style={{
                                        width: 32, height: 32, borderRadius: 4, border: `1px solid ${dotColor}50`,
                                        background: `${dotColor}10`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: dotColor, fontWeight: 700, flexShrink: 0
                                    }}>
                                        {initials(u.name ?? u.username ?? '?')}
                                    </div>
                                    <div className="flex flex-col flex-1 min-w-0">
                                        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: '#e5e5e5', lineHeight: 1.2 }}>{u.name}</span>
                                        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: '#a3a3a3', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.current_task ?? '—'}</span>
                                    </div>
                                    <span className={u.status === 'online' ? 'animate-orange-pulse' : ''} style={{ width: 8, height: 8, borderRadius: '50%', background: dotColor, display: 'inline-block', flexShrink: 0 }}></span>
                                </div>
                            )
                        })}
                        {users.length === 0 && (
                            <div style={{ color: '#555555', fontFamily: "'JetBrains Mono', monospace", fontSize: 10, textAlign: 'center', padding: '16px 0' }}>NO_USERS_FOUND</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
