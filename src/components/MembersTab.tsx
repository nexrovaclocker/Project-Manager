'use client'

import { useEffect, useState, useRef } from 'react'

type User = { id: string; name: string; username: string; role: string; status?: string }

const ROLE_STYLE: Record<string, { text: string; bg: string }> = {
    admin: { text: '#f97316', bg: '#f9731615' },
    member: { text: '#fb923c', bg: '#fb923c15' },
    intern: { text: '#e5e5e5', bg: '#ffffff10' },
}

const STATUS_COLOR: Record<string, string> = {
    online: '#f97316',
    break: '#fb923c',
    offline: '#555555',
}

export function MembersTab() {
    const [users, setUsers] = useState<User[]>([])
    const [msg, setMsg] = useState('')
    const [loading, setLoading] = useState(false)
    const nameRef = useRef<HTMLInputElement>(null)
    const usernameRef = useRef<HTMLInputElement>(null)
    const passwordRef = useRef<HTMLInputElement>(null)
    const confirmPasswordRef = useRef<HTMLInputElement>(null)
    const roleRef = useRef<HTMLSelectElement>(null)

    const loadUsers = async () => {
        try {
            const res = await fetch('/api/users', { cache: 'no-store' })
            if (res.ok) {
                const data = await res.json()
                setUsers(data)
            } else {
                const err = await res.json()
                setMsg(`ERROR: ${err.error ?? 'Failed to load users'}`)
            }
        } catch (e) {
            setMsg('ERROR: Could not fetch users')
        }
    }

    useEffect(() => { loadUsers() }, [])

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault()
        const name = nameRef.current?.value.trim()
        const username = usernameRef.current?.value.trim()
        const password = passwordRef.current?.value
        const confirmPassword = confirmPasswordRef.current?.value
        const role = roleRef.current?.value ?? 'member'

        if (!name || !username || !password || !confirmPassword) {
            setMsg('All fields are required.')
            return
        }
        if (password !== confirmPassword) {
            setMsg('ERROR: Passwords do not match.')
            return
        }
        if (password.length < 8) {
            setMsg('ERROR: Password must be at least 8 characters.')
            return
        }

        setLoading(true)
        setMsg('')

        // POST to /api/users — server-side bcrypt hash happens there
        const res = await fetch('/api/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, username, password, role }),
        })

        setLoading(false)

        if (!res.ok) {
            const err = await res.json()
            setMsg(`ERROR: ${err.error ?? 'Failed to register member'}`)
            return
        }

        setMsg('Member registered successfully.')
        if (nameRef.current) nameRef.current.value = ''
        if (usernameRef.current) usernameRef.current.value = ''
        if (passwordRef.current) passwordRef.current.value = ''
        if (confirmPasswordRef.current) confirmPasswordRef.current.value = ''
        loadUsers()
        setTimeout(() => setMsg(''), 4000)
    }

    return (
        <div className="flex flex-col gap-6">
            <span style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 20, color: '#ffffff' }}>MEMBERS</span>

            {/* Add Member Form */}
            <form onSubmit={handleAdd} className="glass-panel p-5 flex flex-col gap-4">
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: '#a3a3a3', letterSpacing: '1.5px', textTransform: 'uppercase' }}>+ ADD NEW MEMBER</div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <input ref={nameRef} className="glass-input" placeholder="Full Name" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11 }} />
                    <input ref={usernameRef} className="glass-input" placeholder="Username" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11 }} />
                    <select ref={roleRef} className="glass-input" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: '#e5e5e5', background: '#111111', cursor: 'pointer' }}>
                        <option value="member">MEMBER</option>
                        <option value="intern">INTERN</option>
                        <option value="admin">ADMIN</option>
                    </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                        <label style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: '#a3a3a3', letterSpacing: '1.5px', textTransform: 'uppercase' }}>PASSWORD</label>
                        <input ref={passwordRef} type="password" className="glass-input" placeholder="Min. 8 characters" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11 }} />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: '#a3a3a3', letterSpacing: '1.5px', textTransform: 'uppercase' }}>CONFIRM PASSWORD</label>
                        <input ref={confirmPasswordRef} type="password" className="glass-input" placeholder="Repeat password" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11 }} />
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button type="submit" className="glass-button text-[10px]" disabled={loading}>
                        {loading ? 'REGISTERING...' : 'REGISTER MEMBER'}
                    </button>
                    {msg && (
                        <span style={{
                            fontFamily: "'JetBrains Mono', monospace", fontSize: 10,
                            color: msg.startsWith('ERROR') ? '#fb923c' : '#f97316'
                        }}>{msg}</span>
                    )}
                </div>
            </form>

            {/* Users Table */}
            <div className="glass-panel overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-[#f97316]/20">
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: '#a3a3a3', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
                        ALL MEMBERS — {users.length} TOTAL
                    </span>
                    <button className="glass-button !py-1 !px-3 text-[9px]" onClick={loadUsers}>REFRESH</button>
                </div>
                <div className="overflow-x-auto scrollbar-custom">
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: "'JetBrains Mono', monospace", fontSize: 10 }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid #f9731625' }}>
                                {['MEMBER', 'USERNAME', 'ROLE', 'STATUS', 'ACTIONS'].map(h => (
                                    <th key={h} style={{ padding: '12px 16px', color: '#a3a3a3', letterSpacing: '1.5px', textAlign: 'left', fontWeight: 700 }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(u => {
                                const roleCfg = ROLE_STYLE[u.role?.toLowerCase()] ?? ROLE_STYLE.member
                                const dotColor = STATUS_COLOR[u.status ?? 'offline'] ?? '#555555'
                                return (
                                    <tr key={u.id} style={{ borderBottom: '1px solid #ffffff08' }}>
                                        <td style={{ padding: '12px 16px', color: '#ffffff' }}>{u.name}</td>
                                        <td style={{ padding: '12px 16px', color: '#a3a3a3' }}>@{u.username}</td>
                                        <td style={{ padding: '12px 16px' }}>
                                            <span style={{ color: roleCfg.text, background: roleCfg.bg, borderRadius: 4, padding: '2px 8px', fontSize: 9, letterSpacing: '1px' }}>
                                                {u.role?.toUpperCase() ?? 'MEMBER'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '12px 16px' }}>
                                            <div className="flex items-center gap-2">
                                                <span style={{ width: 6, height: 6, borderRadius: '50%', background: dotColor, display: 'inline-block' }}
                                                    className={u.status === 'online' ? 'animate-orange-pulse' : ''}></span>
                                                <span style={{ color: dotColor, textTransform: 'uppercase', letterSpacing: '1px', fontSize: 9 }}>{u.status ?? 'offline'}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '12px 16px' }}>
                                            <button className="glass-button !py-1 !px-3 text-[9px]">EDIT</button>
                                        </td>
                                    </tr>
                                )
                            })}
                            {users.length === 0 && (
                                <tr><td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: '#333333', fontFamily: "'JetBrains Mono', monospace" }}>NO_MEMBERS_FOUND — CHECK_ADMIN_SESSION</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
