'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
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

type ProjectMemberObj = { id: string; userId: string; user: User }
type Project = { id: string; name: string; description: string; members: ProjectMemberObj[] }

// ─── Sub-divider ───────────────────────────────────────────────────────────────
function SubDivider({ label }: { label: string }) {
    return (
        <div className="flex items-center gap-3 pt-2">
            <div className="h-px bg-[var(--color-panel-border)] flex-1" />
            <span className="text-[10px] font-bold tracking-widest text-[var(--color-text-secondary)] uppercase opacity-60">
                {label}
            </span>
            <div className="h-px bg-[var(--color-panel-border)] flex-1" />
        </div>
    )
}

export function AdminPanel() {
    const { data: session } = useSession()
    const [users, setUsers] = useState<User[]>([])
    const [selectedUserId, setSelectedUserId] = useState<string>('')
    const [analytics, setAnalytics] = useState<Analytics | null>(null)


    // Create user state
    const [name, setName] = useState('')
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [role, setRole] = useState('member')
    const [createMsg, setCreateMsg] = useState('')

    // Change password state
    const [cpUserId, setCpUserId] = useState('')
    const [cpNewPass, setCpNewPass] = useState('')
    const [cpConfirmPass, setCpConfirmPass] = useState('')
    const [cpMsg, setCpMsg] = useState('')
    const [cpLoading, setCpLoading] = useState(false)

    // Delete user state
    const [deleteMsg, setDeleteMsg] = useState('')

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

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!cpUserId) {
            setCpMsg('ERROR: SELECT_A_USER')
            return
        }
        if (cpNewPass !== cpConfirmPass) {
            setCpMsg('ERROR: PASSWORDS_DO_NOT_MATCH')
            return
        }
        setCpLoading(true)
        setCpMsg('UPDATING...')
        const res = await fetch(`/api/admin/users/${cpUserId}/password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ newPassword: cpNewPass, confirmPassword: cpConfirmPass }),
        })
        setCpLoading(false)
        if (res.ok) {
            setCpMsg('PASSWORD_UPDATED_SUCCESSFULLY')
            setCpUserId('')
            setCpNewPass('')
            setCpConfirmPass('')
            setTimeout(() => setCpMsg(''), 3000)
        } else {
            let errMsg = 'REQUEST_FAILED'
            try {
                const data = await res.json()
                if (data.error) errMsg = data.error.toUpperCase().replace(/ /g, '_')
            } catch { }
            setCpMsg(`ERROR: ${errMsg}`)
        }
    }

    const handleDeleteUser = async (userId: string, uname: string) => {
        const confirmed = window.confirm(
            `CONFIRM_DELETION\n\nThis will permanently delete user "${uname}" and all associated data.\n\nProceed?`
        )
        if (!confirmed) return

        setDeleteMsg(`DELETING ${uname.toUpperCase()}...`)
        const res = await fetch(`/api/admin/users/${userId}`, {
            method: 'DELETE',
        })

        if (res.ok) {
            setDeleteMsg(`USER_${uname.toUpperCase()}_DELETED`)
            if (selectedUserId === userId) setSelectedUserId('')
            fetchUsers()
            setTimeout(() => setDeleteMsg(''), 3000)
        } else {
            let errMsg = 'REQUEST_FAILED'
            try {
                const data = await res.json()
                if (data.error) errMsg = data.error.toUpperCase().replace(/ /g, '_')
            } catch { }
            setDeleteMsg(`ERROR: ${errMsg}`)
        }
    }



    const inputClass =
        'glass-input w-full'
    const labelClass =
        'block text-[10px] font-bold text-[var(--color-text-secondary)] tracking-widest uppercase mb-2 pl-1'

    return (
        <div className="flex flex-col lg:flex-row h-full bg-transparent text-[var(--color-text-primary)] relative rounded-2xl overflow-hidden glass-panel z-10 transition-all duration-300">
            <div className="absolute top-0 left-0 w-full h-1 bg-[var(--color-brand-accent)] z-20"></div>

            {/* ── Left panel: ACCESS_MANAGEMENT ── */}
            <div className="w-full lg:w-1/2 p-6 lg:p-8 border-r border-[var(--color-panel-border)]/20 space-y-8 overflow-y-auto scrollbar-custom bg-[var(--color-panel)] relative">
                {/* Decorative ambient background */}
                <div className="absolute top-0 left-0 w-64 h-64 bg-[var(--color-brand-accent)]/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>

                <h2 className="text-sm font-bold tracking-widest uppercase flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-[var(--color-brand-accent)] shadow-[0_0_10px_var(--color-brand-accent)]" />
                    ACCESS_MANAGEMENT
                </h2>

                {/* ── CREATE_USER ── */}
                <form onSubmit={handleCreateUser} className="space-y-5 p-5 border border-[var(--color-panel-border)]/20 rounded-xl bg-white shadow-sm relative overflow-hidden group">
                    <div className="absolute right-0 bottom-0 w-32 h-32 bg-[var(--color-orange-accent)]/5 rounded-full blur-2xl -z-10 pointer-events-none group-hover:bg-[var(--color-orange-accent)]/10 transition-colors duration-500"></div>
                    <div>
                        <label className={labelClass}>NAME</label>
                        <input type="text" required className={inputClass} value={name} onChange={(e) => setName(e.target.value)} />
                    </div>
                    <div>
                        <label className={labelClass}>USERNAME</label>
                        <input type="text" required className={inputClass} value={username} onChange={(e) => setUsername(e.target.value)} />
                    </div>
                    <div>
                        <label className={labelClass}>PASSWORD (INITIAL)</label>
                        <input type="password" required className={inputClass} value={password} onChange={(e) => setPassword(e.target.value)} />
                    </div>
                    <div className="relative">
                        <label className={labelClass}>ROLE_LEVEL</label>
                        <select
                            className={`${inputClass} cursor-pointer appearance-none pr-8`}
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                        >
                            <option value="member" className="bg-white text-black">MEMBER (STD_ACCESS)</option>
                            <option value="intern" className="bg-white text-black">INTERN (RESTRICTED)</option>
                            <option value="admin" className="bg-white text-black">ADMIN (ROOT_PRIVILEGES)</option>
                        </select>
                        <div className="absolute right-3 bottom-0 top-6 flex items-center pointer-events-none">
                            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                        </div>
                    </div>
                    <button
                        type="submit"
                        className="w-full glass-button mt-2"
                    >
                        PROVISION_ACCOUNT
                    </button>
                    {createMsg && (
                        <div className={`text-[10px] font-bold tracking-widest uppercase text-center mt-2 drop-shadow-md ${createMsg.startsWith('ERROR') ? 'text-red-400' : 'text-[var(--color-brand-accent)]'}`}>
                            {createMsg}
                        </div>
                    )}
                </form>

                {/* ── CHANGE_PASSWORD ── */}
                <SubDivider label="SECURITY_OVERRIDE" />

                <form onSubmit={handleChangePassword} className="space-y-5">
                    <div className="relative">
                        <label className={labelClass}>TARGET_USER</label>
                        <select
                            className={`${inputClass} cursor-pointer appearance-none pr-8`}
                            value={cpUserId}
                            onChange={(e) => setCpUserId(e.target.value)}
                        >
                            <option value="" className="bg-white text-gray-500">-- SELECT_USER --</option>
                            {users.map((u) => (
                                <option key={u.id} value={u.id} className="bg-white text-black">
                                    {u.username} [{u.role.toUpperCase()}]
                                </option>
                            ))}
                        </select>
                        <div className="absolute right-3 bottom-0 top-6 flex items-center pointer-events-none">
                            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                        </div>
                    </div>
                    <div>
                        <label className={labelClass}>NEW_PASSWORD</label>
                        <input
                            type="password"
                            required
                            className={inputClass}
                            value={cpNewPass}
                            onChange={(e) => setCpNewPass(e.target.value)}
                            placeholder="••••••••"
                        />
                    </div>
                    <div>
                        <label className={labelClass}>CONFIRM_PASSWORD</label>
                        <input
                            type="password"
                            required
                            className={inputClass}
                            value={cpConfirmPass}
                            onChange={(e) => setCpConfirmPass(e.target.value)}
                            placeholder="••••••••"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={cpLoading}
                        className="w-full glass-button disabled:opacity-40 disabled:hover:scale-100 disabled:shadow-none mt-2"
                    >
                        UPDATE_PASSWORD
                    </button>
                    {cpMsg && (
                        <div className={`text-[10px] font-bold tracking-widest uppercase text-center mt-2 drop-shadow-md ${cpMsg.startsWith('ERROR') ? 'text-red-400' : 'text-[var(--color-brand-accent)]'}`}>
                            {cpMsg}
                        </div>
                    )}
                </form>

                {/* ── DELETE_USER ── */}
                <SubDivider label="ROSTER_CONTROL" />

                <div className="space-y-3">
                    {users.length === 0 ? (
                        <div className="text-[10px] tracking-widest text-[var(--color-text-secondary)] uppercase text-center py-6 border border-dashed border-[var(--color-panel-border)]/20 rounded-xl bg-white">
                            NO_USERS_FOUND
                        </div>
                    ) : (
                        <div className="border border-[var(--color-panel-border)]/20 rounded-xl overflow-hidden bg-white shadow-sm">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-[var(--color-brand-accent)]/10 border-b border-[var(--color-panel-border)]/20">
                                    <tr>
                                        <th className="p-3 text-[10px] font-bold tracking-widest text-[var(--color-brand-accent)] uppercase">USER</th>
                                        <th className="p-3 text-[10px] font-bold tracking-widest text-[var(--color-brand-accent)] uppercase">ROLE</th>
                                        <th className="p-3 text-[10px] font-bold tracking-widest text-[var(--color-brand-accent)] uppercase text-right">ACTION</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((u) => {
                                        const isSelf = u.id === session?.user?.id
                                        return (
                                            <tr
                                                key={u.id}
                                                className="border-b border-[var(--color-panel-border)]/10 last:border-none hover:bg-black/5 transition-colors group/row"
                                            >
                                                <td className="p-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[var(--color-brand-accent)]/60 to-[var(--color-brand-accent)] border border-[var(--color-brand-accent)]/20 flex items-center justify-center text-[10px] font-bold text-black shadow-sm">
                                                            {u.username.charAt(0).toUpperCase()}
                                                        </div>
                                                        <span className="font-mono text-xs text-[var(--color-text-primary)] group-hover/row:text-[var(--color-brand-accent)] transition-colors">
                                                            {u.username}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="p-3">
                                                    <span className={`text-[9px] font-bold tracking-widest px-2 py-1 rounded-md border ${
                                                        u.role === 'admin' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                                                        u.role === 'intern' ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400' :
                                                        'bg-blue-500/10 border-blue-500/20 text-blue-400'
                                                    }`}>
                                                        {u.role.toUpperCase()}
                                                    </span>
                                                </td>
                                                <td className="p-3 text-right">
                                                    {isSelf ? (
                                                        <span className="text-[10px] font-bold tracking-widest text-[var(--color-text-secondary)] opacity-50 px-3 uppercase">[SELF]</span>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleDeleteUser(u.id, u.username)}
                                                            className="font-bold tracking-widest text-[10px] uppercase text-red-500 border border-red-300 hover:bg-red-50 hover:border-red-500 px-3 py-1.5 rounded-xl opacity-0 group-hover/row:opacity-100 transition-all ml-auto cursor-pointer"
                                                        >
                                                            TERMINATE
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                    {deleteMsg && (
                        <div className={`text-[10px] font-bold tracking-widest uppercase text-center drop-shadow-md ${deleteMsg.startsWith('ERROR') ? 'text-red-400' : 'text-red-500 animate-pulse'}`}>
                            {deleteMsg}
                        </div>
                    )}
                </div>
            </div>

            {/* ── Right panel: SYS_ANALYTICS ── */}
            <div className="w-full lg:w-1/2 p-6 lg:p-8 flex flex-col h-full overflow-y-auto scrollbar-custom relative bg-transparent">
                {/* Decorative ambient background */}
                <div className="absolute bottom-0 right-0 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>

                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
                    <h2 className="text-sm font-bold tracking-widest uppercase flex items-center gap-3">
                        <span className="w-2 h-2 rounded-full bg-[var(--color-brand-accent)] shadow-[0_0_10px_var(--color-brand-accent)]" />
                        SYS_ANALYTICS
                    </h2>
                    <div className="relative">
                        <select
                            className="glass-input cursor-pointer appearance-none pr-8 text-[11px] font-bold tracking-widest uppercase text-[var(--color-brand-accent)] min-w-[220px]"
                            value={selectedUserId}
                            onChange={(e) => setSelectedUserId(e.target.value)}
                        >
                            <option value="" className="bg-white text-gray-500">-- SELECT_PERSONNEL --</option>
                            {users.map((u) => (
                                <option key={u.id} value={u.id} className="bg-white text-black">
                                    {u.username} ({u.role})
                                </option>
                            ))}
                        </select>
                        <div className="absolute right-3 bottom-0 top-0 flex items-center pointer-events-none">
                            <svg className="w-4 h-4 text-[var(--color-brand-accent)]/50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                        </div>
                    </div>
                </div>

                {analytics ? (
                    <div className="space-y-8 pb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="p-5 rounded-xl border border-[var(--color-panel-border)]/20 bg-[var(--color-brand-accent)]/5 relative overflow-hidden group">
                                <div className="absolute right-0 bottom-0 w-16 h-16 bg-[var(--color-brand-accent)]/10 rounded-full blur-xl group-hover:bg-[var(--color-brand-accent)]/20 transition-colors"></div>
                                <div className="text-[9px] text-[var(--color-brand-accent)] font-bold tracking-widest mb-2 uppercase">TOTAL_TIME_7D</div>
                                <div className="text-2xl font-bold text-[var(--color-text-primary)] flex items-baseline gap-1">
                                    {analytics.totalHours}<span className="text-sm text-[var(--color-brand-accent)]">H</span> {analytics.totalMinutes}<span className="text-sm text-[var(--color-brand-accent)]">M</span>
                                </div>
                            </div>
                            <div className="p-5 rounded-xl border border-[var(--color-panel-border)]/20 bg-[var(--color-brand-accent)]/5 relative overflow-hidden group">
                                <div className="absolute right-0 bottom-0 w-16 h-16 bg-[var(--color-brand-accent)]/10 rounded-full blur-xl group-hover:bg-[var(--color-brand-accent)]/20 transition-colors"></div>
                                <div className="text-[9px] text-[var(--color-brand-accent)] font-bold tracking-widest mb-2 uppercase">SESSIONS_LOGGED</div>
                                <div className="text-2xl font-bold text-[var(--color-text-primary)]">
                                    {analytics.sessions.length}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="h-64 rounded-xl border border-[var(--color-panel-border)]/20 bg-white p-5 shadow-sm group/chart">
                                <div className="text-[10px] font-bold tracking-widest text-[var(--color-text-secondary)] mb-6 uppercase flex items-center justify-between">
                                    HOURS_PER_DAY
                                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-brand-accent)]/50 group-hover/chart:bg-[var(--color-brand-accent)] transition-colors"></div>
                                </div>
                                <ResponsiveContainer width="100%" height="80%">
                                    <BarChart data={analytics.dailyChartData}>
                                        <XAxis dataKey="date" stroke="#888888" fontSize={10} tickLine={false} axisLine={false} />
                                        <YAxis stroke="#888888" fontSize={10} tickLine={false} axisLine={false} />
                                        <Tooltip cursor={{ fill: 'rgba(224,176,69,0.08)' }} contentStyle={{ backgroundColor: '#fff', border: '1px solid #E0B045', borderRadius: '8px' }} itemStyle={{ color: '#E0B045' }} />
                                        <Bar dataKey="hours" fill="#E0B045" radius={[4, 4, 0, 0]} className="hover:opacity-80 transition-opacity" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="h-64 rounded-xl border border-[var(--color-panel-border)]/20 bg-white p-5 shadow-sm group/chart">
                                <div className="text-[10px] font-bold tracking-widest text-[var(--color-text-secondary)] mb-6 uppercase flex items-center justify-between">
                                    SESSION_DURATION
                                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-brand-accent)]/50 group-hover/chart:bg-[var(--color-brand-accent)] transition-colors"></div>
                                </div>
                                <ResponsiveContainer width="100%" height="80%">
                                    <BarChart data={analytics.sessionChartData}>
                                        <XAxis dataKey="name" stroke="#888888" fontSize={10} tickLine={false} axisLine={false} />
                                        <YAxis stroke="#888888" fontSize={10} tickLine={false} axisLine={false} />
                                        <Tooltip cursor={{ fill: 'rgba(224,176,69,0.08)' }} contentStyle={{ backgroundColor: '#fff', border: '1px solid #E0B045', borderRadius: '8px' }} itemStyle={{ color: '#C9A035' }} />
                                        <Bar dataKey="duration" fill="#C9A035" radius={[4, 4, 0, 0]} className="hover:opacity-80 transition-opacity" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="rounded-xl border border-[var(--color-panel-border)]/20 overflow-hidden bg-white shadow-sm">
                            <table className="w-full text-left text-sm text-[var(--color-text-primary)] border-collapse">
                                <thead className="bg-[var(--color-brand-accent)]/10 border-b border-[var(--color-panel-border)]/20">
                                    <tr>
                                        <th className="p-4 text-[10px] font-bold tracking-widest text-[var(--color-brand-accent)] uppercase">CLOCK_IN</th>
                                        <th className="p-4 text-[10px] font-bold tracking-widest text-[var(--color-brand-accent)] uppercase">CLOCK_OUT</th>
                                        <th className="p-4 text-[10px] font-bold tracking-widest text-[var(--color-brand-accent)] uppercase">DUR (MIN)</th>
                                        <th className="p-4 text-[10px] font-bold tracking-widest text-[var(--color-brand-accent)] uppercase w-1/3">SESSION_NOTE</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {analytics.sessions.map((s, idx) => (
                                        <tr key={s.id} className="border-b border-[var(--color-panel-border)]/10 last:border-none hover:bg-black/5 transition-colors">
                                            <td className="p-4 font-mono text-[11px] text-[var(--color-text-primary)]">{new Date(s.clockIn).toLocaleString()}</td>
                                            <td className="p-4 font-mono text-[11px] text-[var(--color-text-primary)]">{new Date(s.clockOut).toLocaleString()}</td>
                                            <td className="p-4 font-mono text-xs text-[var(--color-brand-accent)] font-bold">
                                                <div className="bg-[var(--color-brand-accent)]/10 inline-block px-2 py-1 rounded-md border border-[var(--color-brand-accent)]/20">{s.durationMinutes}</div>
                                            </td>
                                            <td className="p-4 text-[11px] text-[var(--color-text-secondary)] leading-relaxed">{s.sessionNote}</td>
                                        </tr>
                                    ))}
                                    {analytics.sessions.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="p-8 text-center text-[10px] tracking-widest text-[var(--color-text-secondary)] uppercase bg-[var(--color-panel)]">
                                                NO_DATA_AVAILABLE
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-[var(--color-text-secondary)] text-sm tracking-widest uppercase relative">
                        <div className="text-center">
                            <svg className="w-12 h-12 mx-auto text-[var(--color-brand-accent)]/20 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            SELECT_PERSONNEL_TO_VIEW_ANALYTICS
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
