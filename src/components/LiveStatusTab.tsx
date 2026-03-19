'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type User = { id: string; name: string; username: string; role: string; status: string; current_task: string; last_seen: string }

const STATUS_CONFIG: Record<string, { label: string; dot: string; text: string; bg: string; border: string }> = {
    online: { label: '● ONLINE', dot: '#f97316', text: '#f97316', bg: '#f9731615', border: '#f9731630' },
    break: { label: '◐ ON BREAK', dot: '#fb923c', text: '#fb923c', bg: '#fb923c15', border: '#fb923c30' },
    offline: { label: '○ OFFLINE', dot: '#555555', text: '#555555', bg: '#ffffff08', border: '#ffffff10' },
}

function initials(name: string) {
    return (name ?? '?').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

function UserCard({ user }: { user: User }) {
    const cfg = STATUS_CONFIG[user.status] ?? STATUS_CONFIG.offline
    return (
        <div className="glass-panel p-4 flex flex-col gap-3">
            <div className="flex items-center gap-3">
                <div style={{
                    width: 40, height: 40, borderRadius: 4, background: `${cfg.dot}15`,
                    border: `1px solid ${cfg.dot}50`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: "'JetBrains Mono', monospace", fontSize: 13, fontWeight: 700, color: cfg.dot, flexShrink: 0
                }}>
                    {initials(user.name ?? user.username ?? '?')}
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                    <span style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 15, color: '#ffffff' }}>{user.name}</span>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: '#a3a3a3', letterSpacing: '1px', textTransform: 'uppercase' }}>{user.role ?? 'MEMBER'}</span>
                </div>
                <span style={{
                    fontFamily: "'JetBrains Mono', monospace", fontSize: 9, letterSpacing: '1px', textTransform: 'uppercase',
                    color: cfg.text, background: cfg.bg, border: `1px solid ${cfg.border}`, padding: '2px 8px', borderRadius: 4
                }}>{cfg.label}</span>
            </div>
            {user.current_task && (
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: '#a3a3a3', background: '#111111', borderRadius: 4, padding: '6px 10px' }}>
                    ▶ {user.current_task}
                </div>
            )}
            {user.last_seen && (
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: '#555555', letterSpacing: '1px' }}>
                    LAST_SEEN: {new Date(user.last_seen).toLocaleString()}
                </div>
            )}
        </div>
    )
}

function StatusSection({ title, users, cfg }: { title: string; users: User[]; cfg: typeof STATUS_CONFIG[string] }) {
    return (
        <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
                <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: cfg.dot }}
                    className={title === 'ONLINE' ? 'animate-orange-pulse' : ''}></span>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: cfg.text, letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: 700 }}>
                    {title}
                </span>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: cfg.text, background: cfg.bg, border: `1px solid ${cfg.border}`, borderRadius: 4, padding: '0 8px' }}>
                    {users.length}
                </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                {users.map(u => <UserCard key={u.id} user={u} />)}
                {users.length === 0 && (
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: '#333333', padding: '12px 16px', borderRadius: 4, border: '1px dashed #222222', textAlign: 'center' }}>
                        NO_USERS
                    </div>
                )}
            </div>
        </div>
    )
}

export function LiveStatusTab() {
    const [users, setUsers] = useState<User[]>([])

    const loadUsers = async () => {
        const { data } = await supabase.from('User').select('*')
        if (data) setUsers(data)
    }

    useEffect(() => {
        loadUsers()
        const sub = supabase.channel('live_status_users')
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'User' }, (payload) => {
                setUsers(prev => prev.map(u => u.id === payload.new.id ? (payload.new as any) : u))
            })
            .subscribe()
        return () => { supabase.removeChannel(sub) }
    }, [])

    const online = users.filter(u => u.status === 'online')
    const onBreak = users.filter(u => u.status === 'break')
    const offline = users.filter(u => u.status === 'offline' || !u.status)

    return (
        <div className="flex flex-col gap-8">
            <StatusSection title="ONLINE" users={online} cfg={STATUS_CONFIG.online} />
            <StatusSection title="ON BREAK" users={onBreak} cfg={STATUS_CONFIG.break} />
            <StatusSection title="OFFLINE" users={offline} cfg={STATUS_CONFIG.offline} />
        </div>
    )
}
