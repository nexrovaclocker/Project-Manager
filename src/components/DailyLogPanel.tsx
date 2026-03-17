'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

type DailyLog = {
    id: string
    content: string
    createdAt: string
    user: {
        id: string
        username: string
        role: string
    }
}

export function DailyLogPanel() {
    const { data: session } = useSession()
    const [logs, setLogs] = useState<DailyLog[]>([])
    const [newLogContent, setNewLogContent] = useState('')

    useEffect(() => {
        fetchLogs()
    }, [])

    const fetchLogs = async () => {
        const res = await fetch('/api/daily-log', { cache: 'no-store' })
        if (res.ok) {
            const data = await res.json()
            setLogs(data)
        }
    }

    const postLog = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newLogContent.trim()) return

        const res = await fetch('/api/daily-log', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: newLogContent })
        })

        if (res.ok) {
            setNewLogContent('')
            fetchLogs()
        }
    }

    const deleteLog = async (id: string) => {
        if (!confirm('DELETE_LOG_ENTRY?')) return
        await fetch(`/api/daily-log/${id}`, { method: 'DELETE' })
        fetchLogs()
    }

    return (
        <div className="flex flex-col h-full w-full bg-transparent text-[var(--color-text-primary)] relative rounded-2xl overflow-hidden glass-panel z-10 transition-all duration-300">
            <div className="absolute top-0 left-0 w-full h-1 bg-[var(--color-brand-accent)] z-20"></div>

            <div className="flex items-center justify-between p-4 border-b border-[var(--color-panel-border)]/30 bg-[var(--color-panel)] relative">
                {/* Subtle header glow */}
                <div className="absolute -left-10 top-0 w-32 h-10 bg-[var(--color-brand-accent)]/10 blur-2xl rounded-full pointer-events-none"></div>

                <h2 className="text-sm font-bold tracking-widest uppercase flex items-center gap-3 relative z-10">
                    <span className="w-2 h-2 rounded-full bg-[var(--color-brand-accent)] shadow-[0_0_10px_var(--color-brand-accent)]"></span>
                    DAILY_LOG
                </h2>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-custom relative bg-[var(--color-panel)]">
                {/* Decorative ambient background */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-white/[0.01] blur-3xl -z-10 rounded-full pointer-events-none"></div>

                {logs.length === 0 ? (
                    <div className="text-xs text-[var(--color-text-secondary)] tracking-widest text-center py-8 border border-dashed border-[var(--color-panel-border)]/20 rounded-xl bg-white">
                        NO_LOGS_FOUND
                    </div>
                ) : (
                    logs.map(log => (
                        <div key={log.id} className="p-4 rounded-xl border border-[var(--color-panel-border)]/20 bg-white hover:bg-[var(--color-panel-hover)] hover:border-[var(--color-panel-border)]/40 transition-all duration-300 relative group overflow-hidden">
                            {/* Hover highlight bar */}
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[var(--color-brand-accent)]/80 to-transparent"></div>
                            
                            <div className="flex justify-between items-start mb-3 pl-2">
                                <div className="text-[10px] tracking-widest text-[var(--color-text-secondary)] uppercase flex items-center gap-2">
                                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[var(--color-brand-accent)]/60 to-[var(--color-brand-accent)] flex items-center justify-center text-[9px] border border-[var(--color-brand-accent)]/20 text-black font-bold shadow-sm">
                                        {log.user.username.charAt(0).toUpperCase()}
                                    </div>
                                    <span className={log.user.role === 'admin' ? 'text-red-500 font-bold' : 'text-[var(--color-text-primary)] font-bold'}>
                                        {log.user.username}
                                    </span>
                                    <span className="opacity-50 mx-1">/</span> 
                                    <span className="font-mono text-[9px]">{new Date(log.createdAt).toLocaleString()}</span>
                                </div>
                                {(session?.user.role === 'admin' || session?.user.id === log.user.id) && (
                                    <button
                                        onClick={() => deleteLog(log.id)}
                                        className="opacity-0 group-hover:opacity-100 text-[10px] tracking-widest text-red-400 hover:text-red-300 hover:bg-red-500/20 p-1.5 rounded-md transition-all shrink-0"
                                        title="Delete Log"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </button>
                                )}
                            </div>
                            <div className="text-sm whitespace-pre-wrap pl-2 text-[var(--color-text-primary)] leading-relaxed font-sans">
                                {log.content}
                            </div>
                        </div>
                    ))
                )}
            </div>

            <form onSubmit={postLog} className="p-4 border-t border-[var(--color-panel-border)]/30 bg-[var(--color-panel)] flex flex-col gap-3 relative z-10">
                {/* Decorative top border glow */}
                <div className="absolute top-0 left-10 right-10 h-px bg-gradient-to-r from-transparent via-[var(--color-brand-accent)]/50 to-transparent"></div>
                <div className="relative group">
                    <textarea
                        rows={3}
                        className="glass-input w-full text-sm resize-none font-medium leading-relaxed"
                        placeholder="Type your daily log update here..."
                        value={newLogContent}
                        onChange={(e) => setNewLogContent(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault()
                                postLog(e as unknown as React.FormEvent)
                            }
                        }}
                    />
                    <div className="absolute bottom-2 right-3 text-[9px] text-[var(--color-text-secondary)] font-bold tracking-widest uppercase pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity">
                        SHIFT_ENTER_FOR_NEWLINE
                    </div>
                </div>
                <button
                    type="submit"
                    disabled={!newLogContent.trim()}
                    className="glass-button disabled:opacity-40 disabled:hover:border-transparent py-2.5"
                >
                    POST_LOG_ENTRY
                </button>
            </form>
        </div>
    )
}
