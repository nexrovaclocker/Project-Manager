'use client'

import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

type User = {
    id: string
    name: string
    username: string
    role: string
}

type Analytics = {
    sessions: any[]
    totalHours: number
    totalMinutes: number
    dailyChartData: { date: string; hours: number }[]
    sessionChartData: { name: string; duration: number; note: string }[]
}

export function AdminPanel() {
    const [users, setUsers] = useState<User[]>([])
    const [selectedUserId, setSelectedUserId] = useState<string>('')
    const [analytics, setAnalytics] = useState<Analytics | null>(null)

    // Create user state
    const [name, setName] = useState('')
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [role, setRole] = useState('member')
    const [createMsg, setCreateMsg] = useState('')

    useEffect(() => {
        fetchUsers()
    }, [])

    useEffect(() => {
        if (selectedUserId) {
            fetchAnalytics(selectedUserId)
        } else {
            setAnalytics(null)
        }
    }, [selectedUserId])

    const fetchUsers = async () => {
        const res = await fetch('/api/users')
        if (res.ok) {
            const data = await res.json()
            setUsers(data)
        }
    }

    const fetchAnalytics = async (id: string) => {
        const res = await fetch(`/api/analytics/${id}`)
        if (res.ok) {
            const data = await res.json()
            setAnalytics(data)
        }
    }

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault()
        setCreateMsg('CREATING...')
        const res = await fetch('/api/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, username, password, role }),
        })

        if (res.ok) {
            setCreateMsg('USER_CREATED_SUCCESSFULLY')
            setName('')
            setUsername('')
            setPassword('')
            setRole('member')
            fetchUsers()
            setTimeout(() => setCreateMsg(''), 3000)
        } else {
            const data = await res.json()
            setCreateMsg(`ERROR: ${data.error}`)
        }
    }

    return (
        <div className="flex flex-col lg:flex-row h-full">
            {/* Left panel: Create User */}
            <div className="w-full lg:w-1/3 p-6 border-r border-[var(--color-panel-border)] space-y-8">
                <h2 className="text-sm font-bold tracking-widest uppercase flex items-center gap-2 text-[var(--color-text-primary)]">
                    <span className="w-2 h-2 bg-red-500"></span>
                    ACCESS_MANAGEMENT
                </h2>

                <form onSubmit={handleCreateUser} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-[var(--color-text-secondary)] tracking-widest mb-1">NAME</label>
                        <input
                            type="text"
                            required
                            className="w-full bg-[var(--color-bg-dark)] border border-[var(--color-panel-border)] p-2 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 text-[var(--color-text-primary)]"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-[var(--color-text-secondary)] tracking-widest mb-1">USERNAME</label>
                        <input
                            type="text"
                            required
                            className="w-full bg-[var(--color-bg-dark)] border border-[var(--color-panel-border)] p-2 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 text-[var(--color-text-primary)]"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-[var(--color-text-secondary)] tracking-widest mb-1">PASSWORD (INITIAL)</label>
                        <input
                            type="password"
                            required
                            className="w-full bg-[var(--color-bg-dark)] border border-[var(--color-panel-border)] p-2 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 text-[var(--color-text-primary)]"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-[var(--color-text-secondary)] tracking-widest mb-1">ROLE_LEVEL</label>
                        <select
                            className="w-full bg-[var(--color-bg-dark)] border border-[var(--color-panel-border)] p-2 text-sm focus:border-red-500 focus:outline-none text-[var(--color-text-primary)]"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                        >
                            <option value="member">MEMBER (STD_ACCESS)</option>
                            <option value="admin">ADMIN (ROOT_PRIVILEGES)</option>
                        </select>
                    </div>
                    <button
                        type="submit"
                        className="w-full py-3 bg-red-500 text-white font-bold tracking-widest text-xs uppercase hover:bg-red-600 transition-colors mt-4"
                    >
                        PROVISION_ACCOUNT
                    </button>
                    {createMsg && <div className="text-xs text-red-500 font-bold tracking-widest text-center mt-2">{createMsg}</div>}
                </form>
            </div>

            {/* Right panel: Analytics */}
            <div className="w-full lg:w-2/3 p-6 flex flex-col h-full overflow-y-auto scrollbar-custom">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-sm font-bold tracking-widest uppercase flex items-center gap-2 text-[var(--color-text-primary)]">
                        <span className="w-2 h-2 bg-blue-500"></span>
                        SYS_ANALYTICS
                    </h2>
                    <select
                        className="bg-[var(--color-bg-dark)] border border-[var(--color-panel-border)] p-2 text-xs font-bold tracking-widest focus:border-blue-500 focus:outline-none text-[var(--color-text-primary)] uppercase min-w-[200px]"
                        value={selectedUserId}
                        onChange={(e) => setSelectedUserId(e.target.value)}
                    >
                        <option value="">-- SELECT_PERSONNEL --</option>
                        {users.map((u) => (
                            <option key={u.id} value={u.id}>
                                {u.username} ({u.role})
                            </option>
                        ))}
                    </select>
                </div>

                {analytics ? (
                    <div className="space-y-8 pb-8">
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="p-4 border border-[var(--color-panel-border)] bg-[var(--color-bg-dark)]">
                                <div className="text-xs text-[var(--color-text-secondary)] font-bold tracking-widest mb-1">TOTAL_TIME_7D</div>
                                <div className="text-2xl font-bold text-blue-500">{analytics.totalHours}H {analytics.totalMinutes}M</div>
                            </div>
                            <div className="p-4 border border-[var(--color-panel-border)] bg-[var(--color-bg-dark)]">
                                <div className="text-xs text-[var(--color-text-secondary)] font-bold tracking-widest mb-1">SESSIONS_LOGGED</div>
                                <div className="text-2xl font-bold text-blue-500">{analytics.sessions.length}</div>
                            </div>
                        </div>

                        {/* Charts */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="h-64 border border-[var(--color-panel-border)] bg-[var(--color-bg-dark)] p-4">
                                <div className="text-xs font-bold tracking-widest text-[var(--color-text-secondary)] mb-4">HOURS_PER_DAY</div>
                                <ResponsiveContainer width="100%" height="85%">
                                    <BarChart data={analytics.dailyChartData}>
                                        <XAxis dataKey="date" stroke="#888888" fontSize={10} tickLine={false} axisLine={false} />
                                        <YAxis stroke="#888888" fontSize={10} tickLine={false} axisLine={false} />
                                        <Tooltip contentStyle={{ backgroundColor: '#141414', border: '1px solid #222222' }} itemStyle={{ color: '#3b82f6' }} />
                                        <Bar dataKey="hours" fill="#3b82f6" radius={[2, 2, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="h-64 border border-[var(--color-panel-border)] bg-[var(--color-bg-dark)] p-4">
                                <div className="text-xs font-bold tracking-widest text-[var(--color-text-secondary)] mb-4">SESSION_DURATION</div>
                                <ResponsiveContainer width="100%" height="85%">
                                    <BarChart data={analytics.sessionChartData}>
                                        <XAxis dataKey="name" stroke="#888888" fontSize={10} tickLine={false} axisLine={false} />
                                        <YAxis stroke="#888888" fontSize={10} tickLine={false} axisLine={false} />
                                        <Tooltip contentStyle={{ backgroundColor: '#141414', border: '1px solid #222222' }} itemStyle={{ color: '#3b82f6' }} />
                                        <Bar dataKey="duration" fill="#f87171" radius={[2, 2, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Table */}
                        <div className="border border-[var(--color-panel-border)]">
                            <table className="w-full text-left text-sm text-[var(--color-text-primary)]">
                                <thead className="bg-[var(--color-bg-dark)] border-b border-[var(--color-panel-border)]">
                                    <tr>
                                        <th className="p-3 text-xs font-bold tracking-widest text-[var(--color-text-secondary)]">CLOCK_IN</th>
                                        <th className="p-3 text-xs font-bold tracking-widest text-[var(--color-text-secondary)]">CLOCK_OUT</th>
                                        <th className="p-3 text-xs font-bold tracking-widest text-[var(--color-text-secondary)]">DUR (MIN)</th>
                                        <th className="p-3 text-xs font-bold tracking-widest text-[var(--color-text-secondary)]">SESSION_NOTE</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {analytics.sessions.map((s) => (
                                        <tr key={s.id} className="border-b border-[var(--color-panel-border)] hover:bg-[var(--color-bg-dark)] transition-colors">
                                            <td className="p-3 font-mono text-xs">{new Date(s.clockIn).toLocaleString()}</td>
                                            <td className="p-3 font-mono text-xs">{new Date(s.clockOut).toLocaleString()}</td>
                                            <td className="p-3 font-mono text-xs text-blue-500 font-bold">{s.durationMinutes}</td>
                                            <td className="p-3 text-xs text-[var(--color-text-secondary)]">{s.sessionNote}</td>
                                        </tr>
                                    ))}
                                    {analytics.sessions.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="p-4 text-center text-xs tracking-widest text-[var(--color-text-secondary)]">NO_DATA_AVAILABLE</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-[var(--color-text-secondary)] text-sm tracking-widest uppercase">
                        AWAITING_PERSONNEL_SELECTION
                    </div>
                )}
            </div>
        </div>
    )
}
