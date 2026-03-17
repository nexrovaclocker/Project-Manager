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

            {/* ── Left panel: Personnel_Ops ── */}
            <div className="w-full lg:w-1/2 p-6 lg:p-8 border-r border-[#6366F1]/20 space-y-8 overflow-y-auto scrollbar-custom bg-[#1E1E2E]/40 relative">
                {/* Decorative ambient background */}
                <div className="absolute top-0 left-0 w-64 h-64 bg-[#6366F1]/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>

                <h2 className="text-sm font-bold tracking-[0.2em] uppercase flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-[#6366F1] shadow-[0_0_10px_#6366F1]" />
                    Personnel_Intelligence
                </h2>

                {/* ── CREATE_USER ── */}
                <form onSubmit={handleCreateUser} className="space-y-5 p-6 border border-[#6366F1]/20 rounded-2xl bg-black/40 relative overflow-hidden group">
                    <div className="absolute right-0 bottom-0 w-32 h-32 bg-[#6366F1]/5 rounded-full blur-2xl -z-10 pointer-events-none group-hover:bg-[#6366F1]/10 transition-colors duration-500"></div>
                    <div>
                        <label className={labelClass}>Unit_Name</label>
                        <input type="text" required className={inputClass} value={name} onChange={(e) => setName(e.target.value)} />
                    </div>
                    <div>
                        <label className={labelClass}>Signature_Key</label>
                        <input type="text" required className={inputClass} value={username} onChange={(e) => setUsername(e.target.value)} />
                    </div>
                    <div>
                        <label className={labelClass}>Access_Hash (Initial)</label>
                        <input type="password" required className={inputClass} value={password} onChange={(e) => setPassword(e.target.value)} />
                    </div>
                    <div className="relative">
                        <label className={labelClass}>Clearance_Level</label>
                        <select
                            className={`${inputClass} cursor-pointer appearance-none pr-8 !py-2.5`}
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                        >
                            <option value="member" className="bg-[#1E1E2E] text-white">LEVEL_1: PERSONNEL</option>
                            <option value="intern" className="bg-[#1E1E2E] text-white">LEVEL_0: RESTRICTED</option>
                            <option value="admin" className="bg-[#1E1E2E] text-white">LEVEL_2: ROOT_OVERRIDE</option>
                        </select>
                        <div className="absolute right-3 bottom-0 top-6 flex items-center pointer-events-none text-[#6366F1]">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                        </div>
                    </div>
                    <button
                        type="submit"
                        className="w-full glass-button mt-4 py-3"
                    >
                        PROVISION_CLEARANCE
                    </button>
                    {createMsg && (
                        <div className={`text-[10px] font-bold tracking-widest uppercase text-center mt-3 drop-shadow-md ${createMsg.startsWith('ERROR') ? 'text-red-400' : 'text-[#6366F1]'}`}>
                            {createMsg}
                        </div>
                    )}
                </form>

                {/* ── CHANGE_PASSWORD ── */}
                <SubDivider label="SECURITY_OVERRIDE" />

                <form onSubmit={handleChangePassword} className="space-y-5">
                    <div className="relative">
                        <label className={labelClass}>Target_Node</label>
                        <select
                            className={`${inputClass} cursor-pointer appearance-none pr-8 !py-2.5`}
                            value={cpUserId}
                            onChange={(e) => setCpUserId(e.target.value)}
                        >
                            <option value="" className="bg-[#1E1E2E] text-[#94A3B8]">-- SELECT_UNIT --</option>
                            {users.map((u) => (
                                <option key={u.id} value={u.id} className="bg-[#1E1E2E] text-white">
                                    {u.username.toUpperCase()} [{u.role.toUpperCase()}]
                                </option>
                            ))}
                        </select>
                        <div className="absolute right-3 bottom-0 top-6 flex items-center pointer-events-none text-[#6366F1]">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
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
                        className="w-full glass-button mt-4 py-3"
                    >
                        EXECUTE_OVERRIDE
                    </button>
                    {cpMsg && (
                        <div className={`text-[10px] font-bold tracking-widest uppercase text-center mt-3 drop-shadow-md ${cpMsg.startsWith('ERROR') ? 'text-red-400' : 'text-[#6366F1]'}`}>
                            {cpMsg}
                        </div>
                    )}
                </form>

                {/* ── DELETE_USER ── */}
                <SubDivider label="ROSTER_CONTROL" />

                <div className="space-y-4">
                    {users.length === 0 ? (
                        <div className="text-[10px] tracking-widest text-[#94A3B8] uppercase text-center py-10 border border-dashed border-[#6366F1]/20 rounded-2xl bg-black/20">
                            UNIT_ARRAY_EMPTY
                        </div>
                    ) : (
                        <div className="border border-[#6366F1]/20 rounded-2xl overflow-hidden bg-black/40">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-[#6366F1]/10 border-b border-[#6366F1]/20">
                                    <tr>
                                        <th className="p-4 text-[10px] font-bold tracking-[0.2em] text-[#6366F1] uppercase">Operator</th>
                                        <th className="p-4 text-[10px] font-bold tracking-[0.2em] text-[#6366F1] uppercase">Access</th>
                                        <th className="p-4 text-[10px] font-bold tracking-[0.2em] text-[#6366F1] uppercase text-right">State</th>
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
                                                <td className="p-4">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-7 h-7 rounded-full bg-[#6366F1]/20 border border-[#6366F1]/40 flex items-center justify-center text-[11px] font-bold text-white shadow-[0_0_8px_rgba(99,102,241,0.2)]">
                                                            {u.username.charAt(0).toUpperCase()}
                                                        </div>
                                                        <span className="font-bold text-xs text-white tracking-widest">
                                                            {u.username.toUpperCase()}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <span className={`text-[9px] font-bold tracking-widest px-2.5 py-1 rounded-md border ${
                                                        u.role === 'admin' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                                                        u.role === 'intern' ? 'bg-[#6366F1]/10 border-[#6366F1]/20 text-[#6366F1]' :
                                                        'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'
                                                    }`}>
                                                        {u.role.toUpperCase()}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-right">
                                                    {isSelf ? (
                                                        <span className="text-[10px] font-bold tracking-widest text-[#94A3B8] opacity-50 px-3 uppercase">[LOCAL_NODE]</span>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleDeleteUser(u.id, u.username)}
                                                            className="font-bold tracking-widest text-[9px] uppercase text-red-400 border border-red-500/30 hover:bg-red-500/10 px-3 py-1.5 rounded-xl opacity-0 group-hover/row:opacity-100 transition-all ml-auto"
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

                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-6 mb-10 relative z-20">
                    <h2 className="text-sm font-bold tracking-[0.2em] uppercase flex items-center gap-3">
                        <span className="w-2 h-2 rounded-full bg-[#6366F1] shadow-[0_0_10px_#6366F1]" />
                        Deep_Analytics
                    </h2>
                    <div className="relative">
                        <select
                            className="glass-input cursor-pointer appearance-none pr-8 text-[10px] font-bold tracking-widest uppercase text-white min-w-[200px] !py-2.5"
                            value={selectedUserId}
                            onChange={(e) => setSelectedUserId(e.target.value)}
                        >
                            <option value="" className="bg-[#1E1E2E] text-[#94A3B8]">-- PERSONNEL_QUERY --</option>
                            {users.map((u) => (
                                <option key={u.id} value={u.id} className="bg-[#1E1E2E] text-white">
                                    {u.username.toUpperCase()} ({u.role})
                                </option>
                            ))}
                        </select>
                        <div className="absolute right-3 bottom-0 top-0 flex items-center pointer-events-none text-[#6366F1]">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                        </div>
                    </div>
                </div>

                {analytics ? (
                    <div className="space-y-8 pb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="p-6 rounded-2xl border border-[#6366F1]/20 bg-[#6366F1]/5 relative overflow-hidden group">
                                <div className="absolute right-0 bottom-0 w-16 h-16 bg-[#6366F1]/10 rounded-full blur-xl group-hover:bg-[#6366F1]/20 transition-colors"></div>
                                <div className="text-[9px] text-[#94A3B8] font-bold tracking-widest mb-3 uppercase">Total_Work_Cycle</div>
                                <div className="text-2xl font-bold text-white flex items-baseline gap-1">
                                    {analytics.totalHours}<span className="text-xs text-[#6366F1]">H</span> {analytics.totalMinutes}<span className="text-xs text-[#6366F1]">M</span>
                                </div>
                            </div>
                            <div className="p-6 rounded-2xl border border-[#6366F1]/20 bg-[#6366F1]/5 relative overflow-hidden group">
                                <div className="absolute right-0 bottom-0 w-16 h-16 bg-[#6366F1]/10 rounded-full blur-xl group-hover:bg-[#6366F1]/20 transition-colors"></div>
                                <div className="text-[9px] text-[#94A3B8] font-bold tracking-widest mb-3 uppercase">Sessions_Detected</div>
                                <div className="text-2xl font-bold text-white">
                                    {analytics.sessions.length}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="h-72 rounded-2xl border border-[#6366F1]/20 bg-black/40 p-6 shadow-sm group/chart">
                                <div className="text-[10px] font-bold tracking-widest text-[#94A3B8] mb-8 uppercase flex items-center justify-between">
                                    Productivity_Matrix
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#6366F1] shadow-[0_0_8px_#6366F1] animate-pulse"></div>
                                </div>
                                <ResponsiveContainer width="100%" height="75%">
                                    <BarChart data={analytics.dailyChartData}>
                                        <XAxis dataKey="date" stroke="#4B5563" fontSize={10} tickLine={false} axisLine={false} />
                                        <YAxis stroke="#4B5563" fontSize={10} tickLine={false} axisLine={false} />
                                        <Tooltip cursor={{ fill: 'rgba(99,102,241,0.05)' }} contentStyle={{ backgroundColor: '#1E1E2E', border: '1px solid #6366F1', borderRadius: '12px' }} itemStyle={{ color: '#6366F1' }} />
                                        <Bar dataKey="hours" fill="#6366F1" radius={[4, 4, 0, 0]} className="hover:opacity-80 transition-opacity" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="h-72 rounded-2xl border border-[#6366F1]/20 bg-black/40 p-6 shadow-sm group/chart">
                                <div className="text-[10px] font-bold tracking-widest text-[#94A3B8] mb-8 uppercase flex items-center justify-between">
                                    Session_Granularity
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#6366F1] shadow-[0_0_8px_#6366F1] animate-pulse"></div>
                                </div>
                                <ResponsiveContainer width="100%" height="75%">
                                    <BarChart data={analytics.sessionChartData}>
                                        <XAxis dataKey="name" stroke="#4B5563" fontSize={10} tickLine={false} axisLine={false} />
                                        <YAxis stroke="#4B5563" fontSize={10} tickLine={false} axisLine={false} />
                                        <Tooltip cursor={{ fill: 'rgba(99,102,241,0.05)' }} contentStyle={{ backgroundColor: '#1E1E2E', border: '1px solid #6366F1', borderRadius: '12px' }} itemStyle={{ color: '#6366F1' }} />
                                        <Bar dataKey="duration" fill="#6366F1" radius={[4, 4, 0, 0]} className="hover:opacity-80 transition-opacity" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-[#6366F1]/20 overflow-hidden bg-black/40">
                            <table className="w-full text-left text-sm text-white border-collapse">
                                <thead className="bg-[#6366F1]/10 border-b border-[#6366F1]/20">
                                    <tr>
                                        <th className="p-4 text-[10px] font-bold tracking-[0.2em] text-[#6366F1] uppercase">Init_Sync</th>
                                        <th className="p-4 text-[10px] font-bold tracking-[0.2em] text-[#6366F1] uppercase">Term_Sync</th>
                                        <th className="p-4 text-[10px] font-bold tracking-[0.2em] text-[#6366F1] uppercase">Cycle (Min)</th>
                                        <th className="p-4 text-[10px] font-bold tracking-[0.2em] text-[#6366F1] uppercase w-1/3">Data_Log</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {analytics.sessions.map((s, idx) => (
                                        <tr key={s.id} className="border-b border-[#6366F1]/10 last:border-none hover:bg-white/5 transition-colors">
                                            <td className="p-4 font-bold text-[10px] text-[#94A3B8] tracking-widest">{new Date(s.clockIn).toLocaleString().toUpperCase()}</td>
                                            <td className="p-4 font-bold text-[10px] text-[#94A3B8] tracking-widest">{new Date(s.clockOut).toLocaleString().toUpperCase()}</td>
                                            <td className="p-4">
                                                <div className="bg-[#6366F1]/20 inline-block px-3 py-1 rounded-full border border-[#6366F1]/40 text-[10px] font-bold text-white shadow-[0_0_10px_rgba(99,102,241,0.2)]">{s.durationMinutes}</div>
                                            </td>
                                            <td className="p-4 text-[11px] text-[#94A3B8] leading-relaxed uppercase italic">{s.sessionNote}</td>
                                        </tr>
                                    ))}
                                    {analytics.sessions.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="p-10 text-center text-[10px] tracking-widest text-[#94A3B8] uppercase">
                                                NULL_DATA_STREAM
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
