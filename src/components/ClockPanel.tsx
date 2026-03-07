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
        <div className="flex flex-col h-full w-full p-6 text-[var(--color-text-primary)] overflow-y-auto scrollbar-custom">
            <h2 className="text-sm font-bold tracking-widest uppercase mb-8 flex items-center gap-2">
                <span className="w-2 h-2 bg-[var(--color-brand-accent)] inline-block"></span>
                Time_Tracking
            </h2>

            <div className="flex-1 flex flex-col items-center justify-center gap-8">
                {status === 'loading' ? (
                    <div className="animate-pulse text-[var(--color-text-secondary)]">FETCHING_SYS_STATE...</div>
                ) : (
                    <>
                        <div className="text-center space-y-2">
                            <div className="text-xs font-bold tracking-widest text-[var(--color-text-secondary)]">CURRENT_STATUS:</div>
                            <div className={`text-2xl font-bold tracking-widest ${status === 'clocked_in' ? 'text-[var(--color-brand-accent)]' : 'text-red-500'}`}>
                                [{status === 'clocked_in' ? 'ACTIVE_SESSION' : 'OFFLINE'}]
                            </div>
                        </div>

                        {error && <div className="text-red-500 text-xs font-bold border border-red-500 p-2 w-full text-center">{error}</div>}

                        {status === 'clocked_out' && (
                            <div className="w-full max-w-xs flex flex-col gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider mb-2">
                                        START_TIME
                                    </label>
                                    <input
                                        type="time"
                                        value={manualTime}
                                        onChange={(e) => setManualTime(e.target.value)}
                                        className="font-mono w-full p-2 bg-[var(--color-bg-dark)] border border-[var(--color-panel-border)] focus:border-[var(--color-brand-accent)] focus:ring-1 focus:ring-[var(--color-brand-accent)] outline-none text-sm text-[var(--color-text-primary)] leading-tight rounded-xl"
                                    />
                                </div>
                                <button
                                    onClick={handleClockIn}
                                    className="w-full py-4 border-2 border-[var(--color-brand-accent)] text-[var(--color-brand-accent)] font-bold text-lg tracking-widest uppercase transition-all hover:bg-[var(--color-brand-accent)] hover:text-[var(--color-bg-dark)] shadow-[0_0_15px_rgba(0,255,136,0.2)] hover:shadow-[0_0_25px_rgba(0,255,136,0.5)]"
                                >
                                    CLOCK_IN
                                </button>
                            </div>
                        )}

                        {status === 'clocked_in' && !isClockingOut && (
                            <button
                                onClick={() => setIsClockingOut(true)}
                                className="w-full max-w-xs py-4 border-2 border-red-500 text-red-500 font-bold text-lg tracking-widest uppercase transition-all hover:bg-red-500 hover:text-[var(--color-bg-dark)] shadow-[0_0_15px_rgba(239,68,68,0.2)] hover:shadow-[0_0_25px_rgba(239,68,68,0.5)]"
                            >
                                INITIATE_CLOCK_OUT
                            </button>
                        )}

                        {isClockingOut && (
                            <div className="w-full max-w-xs space-y-4 animate-in fade-in slide-in-from-bottom-4">
                                <div>
                                    <label className="block text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider mb-2">
                                        END_TIME
                                    </label>
                                    <input
                                        type="time"
                                        value={manualTime}
                                        onChange={(e) => setManualTime(e.target.value)}
                                        className="w-full p-2 bg-[var(--color-bg-dark)] border border-[var(--color-panel-border)] focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none text-sm text-[var(--color-text-primary)] leading-tight mb-4"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider mb-2">
                                        &gt; SESSION_REPORT (What did you work on?)
                                    </label>
                                    <textarea
                                        rows={3}
                                        className="w-full p-2 bg-[var(--color-bg-dark)] border border-[var(--color-panel-border)] focus:border-[var(--color-brand-accent)] focus:ring-1 focus:ring-[var(--color-brand-accent)] outline-none text-sm resize-none"
                                        placeholder="ENTER_TASKS_COMPLETED..."
                                        value={sessionNote}
                                        onChange={(e) => setSessionNote(e.target.value)}
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setIsClockingOut(false)}
                                        className="flex-1 py-2 border border-[var(--color-panel-border)] text-xs font-bold tracking-widest text-[var(--color-text-secondary)] hover:text-white transition-colors"
                                    >
                                        CANCEL
                                    </button>
                                    <button
                                        onClick={handleClockOut}
                                        className="flex-1 py-2 bg-red-500 text-[var(--color-bg-dark)] text-xs font-bold tracking-widest hover:bg-red-400 transition-colors"
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
