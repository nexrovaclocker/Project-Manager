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
        <div className="flex flex-col h-full w-full p-6 text-white overflow-y-auto scrollbar-custom bg-transparent relative z-10">
            <h2 className="text-sm font-bold tracking-widest uppercase mb-8 flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-[#6366F1] shadow-[0_0_10px_#6366F1] inline-block"></span>
                Time_Control_Center
            </h2>

            <div className="flex-1 flex flex-col items-center justify-center gap-8 relative">
                {/* Decorative background glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-[#6366F1]/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>

                {status === 'loading' ? (
                    <div className="animate-pulse text-[#94A3B8] tracking-widest text-sm font-medium uppercase font-mono">System_Syncing...</div>
                ) : (
                    <>
                        <div className="text-center space-y-2">
                            <div className="text-[10px] font-bold tracking-[0.2em] text-[#94A3B8] uppercase">Current_State:</div>
                            <div className={`text-2xl font-bold tracking-[0.1em] ${status === 'clocked_in' ? 'text-white' : 'text-red-400'}`}>
                                {status === 'clocked_in' ? 'ACTIVE_SESSION' : 'OFFLINE'}
                            </div>
                        </div>

                        {error && <div className="text-red-400 text-[10px] tracking-widest font-bold bg-red-500/10 border border-red-500/20 rounded-xl p-3 w-full text-center shadow-sm uppercase">{error}</div>}

                        {status === 'clocked_out' && (
                            <div className="w-full max-w-xs flex flex-col gap-5">
                                <div>
                                    <label className="block text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest mb-2 pl-1">
                                        Session_Start
                                    </label>
                                    <input
                                        type="time"
                                        value={manualTime}
                                        onChange={(e) => setManualTime(e.target.value)}
                                        className="glass-input w-full text-center tracking-widest"
                                    />
                                </div>
                                <button
                                    onClick={handleClockIn}
                                    className="glass-button w-full py-4 tracking-[0.2em]"
                                >
                                    START_OPERATIONS
                                </button>
                            </div>
                        )}

                        {status === 'clocked_in' && !isClockingOut && (
                            <button
                                onClick={() => setIsClockingOut(true)}
                                className="glass-button w-full max-w-xs py-4 tracking-[0.2em]"
                            >
                                INITIATE_TERMINATION
                            </button>
                        )}

                        {isClockingOut && (
                            <div className="w-full max-w-xs space-y-5 animate-in fade-in slide-in-from-bottom-4">
                                <div>
                                    <label className="block text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest mb-2 pl-1">
                                        Session_End
                                    </label>
                                    <input
                                        type="time"
                                        value={manualTime}
                                        onChange={(e) => setManualTime(e.target.value)}
                                        className="glass-input w-full text-center tracking-widest"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest mb-2 pl-1 flex items-center gap-2">
                                        <span className="text-[#6366F1]">↳</span> Performance_Log
                                    </label>
                                    <textarea
                                        rows={3}
                                        className="glass-input w-full resize-none"
                                        placeholder="Operational summary..."
                                        value={sessionNote}
                                        onChange={(e) => setSessionNote(e.target.value)}
                                    />
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setIsClockingOut(false)}
                                        className="flex-1 px-4 py-2 text-[10px] font-bold tracking-widest text-[#94A3B8] hover:text-white transition-colors"
                                    >
                                        ABORT
                                    </button>
                                    <button
                                        onClick={handleClockOut}
                                        className="glass-button flex-1"
                                    >
                                        FINALIZE
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
