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
        <div className="flex flex-col h-full w-full bg-transparent text-white relative rounded-2xl overflow-hidden glass-panel z-10">
            <div className="flex items-center justify-between p-6 border-b border-[#6366F1]/20 bg-[#1E1E2E] relative">
                <h2 className="text-sm font-bold tracking-[0.2em] uppercase flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-[#6366F1] shadow-[0_0_10px_#6366F1]"></span>
                    Operational_Logs
                </h2>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-custom bg-[#1E1E2E]/20">
                {logs.length === 0 ? (
                    <div className="text-[10px] text-[#94A3B8] tracking-widest text-center py-10 border border-dashed border-[#6366F1]/20 rounded-2xl bg-[#1E1E2E]">
                        EMPTY_LOG_RETRIEVAL
                    </div>
                ) : (
                    logs.map(log => (
                        <div key={log.id} className="p-5 rounded-2xl border border-[#6366F1]/10 bg-[#1E1E2E]/60 hover:border-[#6366F1]/30 transition-all duration-300 relative group overflow-hidden">
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#6366F1]/50"></div>
                            
                            <div className="flex justify-between items-start mb-3">
                                <div className="text-[10px] tracking-widest text-[#94A3B8] uppercase flex items-center gap-2">
                                    <span className={`px-2 py-0.5 rounded bg-[#6366F1]/10 text-[#6366F1] font-bold border border-[#6366F1]/20`}>
                                        {log.user.username}
                                    </span>
                                    <span className="opacity-40">/</span> 
                                    <span>{new Date(log.createdAt).toLocaleTimeString()}</span>
                                </div>
                                {(session?.user.role === 'admin' || session?.user.id === log.user.id) && (
                                    <button
                                        onClick={() => deleteLog(log.id)}
                                        className="opacity-0 group-hover:opacity-100 p-1 rounded-lg text-red-400 hover:bg-red-500/10 transition-all"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </button>
                                )}
                            </div>
                            <div className="text-sm leading-relaxed text-white font-medium pl-1">
                                {log.content}
                            </div>
                        </div>
                    ))
                )}
            </div>

            <form onSubmit={postLog} className="p-6 border-t border-[#6366F1]/20 bg-[#1E1E2E] flex flex-col gap-4">
                <div className="relative">
                    <textarea
                        rows={3}
                        className="glass-input !bg-black/20"
                        placeholder="Log operational update..."
                        value={newLogContent}
                        onChange={(e) => setNewLogContent(e.target.value)}
                    />
                </div>
                <button
                    type="submit"
                    disabled={!newLogContent.trim()}
                    className="glass-button py-3 text-[10px] tracking-[0.2em]"
                >
                    POST_UPDATE
                </button>
            </form>
        </div>
    )
}
