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
        <div className="flex flex-col h-full w-full bg-[var(--color-bg-dark)] text-[var(--color-text-primary)] relative border border-[var(--color-panel-border)] rounded-2xl overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-[var(--color-brand-accent)]"></div>

            <div className="flex items-center justify-between p-4 border-b border-[var(--color-panel-border)]">
                <h2 className="text-sm font-bold tracking-widest uppercase flex items-center gap-2">
                    <span className="w-2 h-2 bg-[var(--color-brand-accent)]"></span>
                    DAILY_LOG
                </h2>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-custom bg-[var(--color-panel)]">
                {logs.length === 0 ? (
                    <div className="text-xs text-[var(--color-text-secondary)] tracking-widest text-center py-4">
                        NO_LOGS_FOUND
                    </div>
                ) : (
                    logs.map(log => (
                        <div key={log.id} className="p-3 border-l-2 border-[var(--color-brand-accent)] bg-[var(--color-bg-dark)] relative group">
                            <div className="flex justify-between items-start mb-2">
                                <div className="text-[10px] tracking-widest text-[var(--color-text-secondary)] uppercase">
                                    <span className={log.user.role === 'admin' ? 'text-red-500' : 'text-[var(--color-text-primary)]'}>
                                        {log.user.username}
                                    </span>
                                    {' '}// {new Date(log.createdAt).toLocaleString()}
                                </div>
                                {(session?.user.role === 'admin' || session?.user.id === log.user.id) && (
                                    <button
                                        onClick={() => deleteLog(log.id)}
                                        className="opacity-0 group-hover:opacity-100 text-[10px] tracking-widest text-red-500 hover:text-white hover:bg-red-500 border border-red-500/30 px-1 transition-all"
                                    >
                                        DEL
                                    </button>
                                )}
                            </div>
                            <div className="text-sm whitespace-pre-wrap">
                                {log.content}
                            </div>
                        </div>
                    ))
                )}
            </div>

            <form onSubmit={postLog} className="p-4 border-t border-[var(--color-panel-border)] bg-[var(--color-bg-dark)] flex flex-col gap-2">
                <textarea
                    rows={2}
                    className="w-full text-sm bg-[var(--color-panel)] border border-[var(--color-panel-border)] p-2 focus:border-[var(--color-brand-accent)] focus:outline-none resize-none placeholder:text-[var(--color-text-secondary)] uppercase"
                    placeholder="ENTER_LOG_UPDATE..."
                    value={newLogContent}
                    onChange={(e) => setNewLogContent(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault()
                            postLog(e as unknown as React.FormEvent)
                        }
                    }}
                />
                <button
                    type="submit"
                    disabled={!newLogContent.trim()}
                    className="text-xs font-bold tracking-widest py-2 border border-[var(--color-panel-border)] hover:text-[var(--color-brand-accent)] hover:border-[var(--color-brand-accent)] transition-colors disabled:opacity-50 disabled:hover:text-[var(--color-text-primary)] disabled:hover:border-[var(--color-panel-border)]"
                >
                    POST_LOG
                </button>
            </form>
        </div>
    )
}
