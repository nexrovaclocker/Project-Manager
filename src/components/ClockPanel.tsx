'use client'

import { useState, useEffect } from 'react'

export function ClockPanel() {
    const [status, setStatus] = useState<'clocked_in' | 'clocked_out' | 'loading'>('loading')
    const [sessionNote, setSessionNote] = useState('')
    const [isClockingOut, setIsClockingOut] = useState(false)
    const [error, setError] = useState('')
    const [manualTime, setManualTime] = useState('')

    const resetTime = () => {
        const now = new Date()
        const hh = String(now.getHours()).padStart(2, '0')
        const mm = String(now.getMinutes()).padStart(2, '0')
        setManualTime(`${hh}:${mm}`)
    }

    useEffect(() => {
        fetchStatus()
        resetTime()
    }, [])

    const fetchStatus = async () => {
        try {
            const res = await fetch('/api/clock/status')
            const data = await res.json()
            if (res.ok) {
                setStatus(data.status)
            }
        } catch (err) {
            console.error(err)
        }
    }

    const handleClockIn = async () => {
        setError('')
        try {
            setStatus('loading')
            const res = await fetch('/api/clock/in', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ manualTime })
            })
            if (!res.ok) throw new Error('Failed to clock in')
            await fetchStatus()
            resetTime()
        } catch (err: any) {
            setError(err.message)
            setStatus('clocked_out')
        }
    }

    const handleClockOut = async () => {
        if (!sessionNote.trim()) {
            setError('PLEASE_PROVIDE_SESSION_NOTE')
            return
        }
        setError('')
        try {
            setStatus('loading')
            const res = await fetch('/api/clock/out', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sessionNote, manualTime }),
            })
            if (!res.ok) throw new Error('Failed to clock out')
            setIsClockingOut(false)
            setSessionNote('')
            await fetchStatus()
            resetTime()
        } catch (err: any) {
            setError(err.message)
            setStatus('clocked_in')
        }
    }

    return (
        <div className="flex flex-col h-full w-full p-6 text-[var(--color-text-primary)] overflow-y-auto scrollbar-custom bg-transparent relative z-10">
            <h2 className="text-sm font-bold tracking-widest uppercase mb-8 flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-[var(--color-brand-accent)] shadow-[0_0_10px_var(--color-brand-accent)] inline-block"></span>
                Time_Tracking
            </h2>

            <div className="flex-1 flex flex-col items-center justify-center gap-8 relative">
                {/* Decorative background glow for clock center */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-[var(--color-brand-accent)]/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>

                {status === 'loading' ? (
                    <div className="animate-pulse text-[var(--color-text-secondary)] tracking-widest text-sm font-medium">FETCHING_SYS_STATE...</div>
                ) : (
                    <>
                        <div className="text-center space-y-2">
                            <div className="text-xs font-bold tracking-widest text-[var(--color-text-secondary)] uppercase">CURRENT_STATUS:</div>
                            <div className={`text-2xl font-bold tracking-widest drop-shadow-lg ${status === 'clocked_in' ? 'text-[var(--color-brand-accent)]' : 'text-[var(--color-orange-accent)]'}`}>
                                [{status === 'clocked_in' ? 'ACTIVE_SESSION' : 'OFFLINE'}]
                            </div>
                        </div>

                        {error && <div className="text-red-500 text-xs tracking-widest font-medium bg-red-500/10 border border-red-500/30 rounded-xl p-3 w-full text-center shadow-sm">{error}</div>}

                        {status === 'clocked_out' && (
                            <div className="w-full max-w-xs flex flex-col gap-5">
                                <div>
                                    <label className="block text-[10px] font-bold text-[var(--color-text-secondary)] uppercase tracking-widest mb-2 pl-1">
                                        START_TIME
                                    </label>
                                    <input
                                        type="time"
                                        value={manualTime}
                                        onChange={(e) => setManualTime(e.target.value)}
                                        className="glass-input w-full font-mono text-center tracking-widest"
                                    />
                                </div>
                                <button
                                    onClick={handleClockIn}
                                    className="w-full py-4 rounded-xl border border-[var(--color-brand-accent)]/50 bg-[var(--color-brand-accent)]/10 text-[var(--color-brand-accent)] font-bold tracking-widest uppercase transition-all duration-300 hover:bg-[var(--color-brand-accent)]/20 hover:border-[var(--color-brand-accent)] hover:-translate-y-1 shadow-sm hover:shadow-md active:scale-95"
                                >
                                    CLOCK_IN
                                </button>
                            </div>
                        )}

                        {status === 'clocked_in' && !isClockingOut && (
                            <button
                                onClick={() => setIsClockingOut(true)}
                                className="w-full max-w-xs py-4 rounded-xl border border-[var(--color-brand-accent)]/50 bg-[var(--color-brand-accent)]/10 text-[var(--color-brand-accent)] font-bold tracking-widest uppercase transition-all duration-300 hover:bg-[var(--color-brand-accent)]/20 hover:border-[var(--color-brand-accent)] hover:-translate-y-1 shadow-sm hover:shadow-md active:scale-95"
                            >
                                INITIATE_CLOCK_OUT
                            </button>
                        )}

                        {isClockingOut && (
                            <div className="w-full max-w-xs space-y-5 animate-in fade-in slide-in-from-bottom-4">
                                <div>
                                    <label className="block text-[10px] font-bold text-[var(--color-text-secondary)] uppercase tracking-widest mb-2 pl-1">
                                        END_TIME
                                    </label>
                                    <input
                                        type="time"
                                        value={manualTime}
                                        onChange={(e) => setManualTime(e.target.value)}
                                        className="glass-input w-full font-mono text-center tracking-widest focus:border-[var(--color-orange-accent)] focus:ring-[var(--color-orange-accent)]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-[var(--color-text-secondary)] uppercase tracking-widest mb-2 pl-1 flex items-center gap-2">
                                        <span className="text-[var(--color-brand-accent)]">↳</span> SESSION_REPORT
                                    </label>
                                    <textarea
                                        rows={3}
                                        className="glass-input w-full resize-none focus:border-[var(--color-orange-accent)] focus:ring-[var(--color-orange-accent)]"
                                        placeholder="What did you work on?..."
                                        value={sessionNote}
                                        onChange={(e) => setSessionNote(e.target.value)}
                                    />
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setIsClockingOut(false)}
                                        className="glass-button flex-1"
                                    >
                                        CANCEL
                                    </button>
                                    <button
                                        onClick={handleClockOut}
                                        className="glass-button flex-1"
                                    >
                                        CONFIRM
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}
