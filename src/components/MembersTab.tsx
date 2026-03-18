'use client'

import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'

type User = { id: string; name: string; username: string; email: string; role: string; status: string }
type ClockSession = { userId: string }

const ROLE_STYLE: Record<string, { text: string; bg: string }> = {
    ADMIN: { text: '#f97316', bg: '#f9731615' },
    MEMBER: { text: '#fb923c', bg: '#fb923c15' },
    INTERN: { text: '#e5e5e5', bg: '#ffffff10' },
}

const STATUS_COLOR: Record<string, string> = {
    online: '#f97316',
    break: '#fb923c',
    offline: '#555555',
}

export function MembersTab() {
    const [users, setUsers] = useState<User[]>([])
    const [sessions, setSessions] = useState<ClockSession[]>([])
    const [msg, setMsg] = useState('')
    const nameRef = useRef<HTMLInputElement>(null)
    const usernameRef = useRef<HTMLInputElement>(null)
    const emailRef = useRef<HTMLInputElement>(null)
    const roleRef = useRef<HTMLSelectElement>(null)

    const loadUsers = async () => {
        const [{ data: u }, { data: s }] = await Promise.all([
            supabase.from('User').select('*'),
            supabase.from('ClockSession').select('userId'),
        ])
        if (u) setUsers(u)
        if (s) setSessions(s)
    }

    useEffect(() => { loadUsers() }, [])

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault()
        const name = nameRef.current?.value.trim()
        const username = usernameRef.current?.value.trim()
        const email = emailRef.current?.value.trim()
        const role = roleRef.current?.value ?? 'MEMBER'
        if (!name || !username || !email) { setMsg('All fields required.'); return }
        const { error } = await supabase.from('User').insert({ name, username, email, role, status: 'offline' })
        if (error) { setMsg(`ERROR: ${error.message}`); return }
        setMsg('Member added.')
        if (nameRef.current) nameRef.current.value = ''
        if (usernameRef.current) usernameRef.current.value = ''
        if (emailRef.current) emailRef.current.value = ''
        loadUsers()
        setTimeout(() => setMsg(''), 3000)
    }

    const sessionsByUser = (userId: string) => sessions.filter(s => s.userId === userId).length

    return (
        <div className="flex flex-col gap-6">
            <span style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 20, color: '#ffffff' }}>MEMBERS</span>

            {/* Add Member Form */}
            <form onSubmit={handleAdd} className="glass-panel p-5 flex flex-col gap-4">
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: '#a3a3a3', letterSpacing: '1.5px', textTransform: 'uppercase' }}>+ ADD NEW MEMBER</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <input ref={nameRef} className="glass-input" placeholder="Full Name" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11 }} />
                    <input ref={usernameRef} className="glass-input" placeholder="Username" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11 }} />
                    <input ref={emailRef} className="glass-input" placeholder="Email" type="email" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11 }} />
                    <select ref={roleRef} className="glass-input" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: '#e5e5e5', background: '#111111', cursor: 'pointer' }}>
                        <option value="MEMBER">MEMBER</option>
                        <option value="INTERN">INTERN</option>
                        <option value="ADMIN">ADMIN</option>
                    </select>
                </div>
                <div className="flex items-center gap-4">
                    <button type="submit" className="glass-button text-[10px]">REGISTER MEMBER</button>
                    {msg && <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: msg.startsWith('ERROR') ? '#fb923c' : '#f97316' }}>{msg}</span>}
                </div>
            </form>

            {/* Users Table */}
            <div className="glass-panel overflow-hidden">
                <div className="overflow-x-auto scrollbar-custom">
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: "'JetBrains Mono', monospace", fontSize: 10 }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid #f9731625' }}>
                                {['MEMBER', 'USERNAME', 'ROLE', 'STATUS', 'SESSIONS', 'ACTIONS'].map(h => (
                                    <th key={h} style={{ padding: '12px 16px', color: '#a3a3a3', letterSpacing: '1.5px', textAlign: 'left', fontWeight: 700 }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(u => {
                                const roleCfg = ROLE_STYLE[u.role?.toUpperCase()] ?? ROLE_STYLE.MEMBER
                                const dotColor = STATUS_COLOR[u.status] ?? '#555555'
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
                                        <td style={{ padding: '12px 16px', color: '#a3a3a3' }}>{sessionsByUser(u.id)}</td>
                                        <td style={{ padding: '12px 16px' }}>
                                            <button className="glass-button !py-1 !px-3 text-[9px]">EDIT</button>
                                        </td>
                                    </tr>
                                )
                            })}
                            {users.length === 0 && (
                                <tr><td colSpan={6} style={{ padding: '24px', textAlign: 'center', color: '#333333' }}>NO_MEMBERS_FOUND</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
