'use client'

import { useState } from 'react'

type Toggle = { id: string; label: string; defaultOn?: boolean }
type Section = { title: string; toggles: Toggle[] }

const SECTIONS: Section[] = [
    {
        title: 'NOTIFICATIONS',
        toggles: [
            { id: 'login_notif', label: 'Login Notifications' },
            { id: 'task_toast', label: 'Task Assignment Toasts', defaultOn: true },
            { id: 'break_alert', label: 'Break Alerts over 30 min' },
        ],
    },
    {
        title: 'WORKSPACE',
        toggles: [
            { id: 'require_task', label: 'Require Task on Clock-In', defaultOn: true },
            { id: 'auto_clock_out', label: 'Auto Clock-Out at Midnight' },
            { id: 'intern_approval', label: 'Intern Log Approval' },
        ],
    },
    {
        title: 'INTEGRATIONS',
        toggles: [],
    },
]

function ToggleSwitch({ on, onChange }: { on: boolean; onChange: () => void }) {
    return (
        <button
            onClick={onChange}
            style={{
                width: 40, height: 22, borderRadius: 11, position: 'relative',
                background: on ? '#f9731630' : '#111111',
                border: `1px solid ${on ? '#f9731650' : '#333333'}`,
                cursor: 'pointer', transition: 'all 0.2s', flexShrink: 0,
            }}
        >
            <span style={{
                position: 'absolute', top: 2,
                left: on ? 20 : 2,
                width: 16, height: 16, borderRadius: '50%',
                background: on ? '#f97316' : '#555555',
                transition: 'left 0.2s',
            }}></span>
        </button>
    )
}

function ToggleRow({ label, on, onChange }: { label: string; on: boolean; onChange: () => void }) {
    return (
        <div className="flex items-center justify-between py-3 border-b border-[#ffffff08]">
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: '#e5e5e5' }}>{label}</span>
            <ToggleSwitch on={on} onChange={onChange} />
        </div>
    )
}

export function SettingsTab() {
    const initial: Record<string, boolean> = {}
    SECTIONS.forEach(s => s.toggles.forEach(t => { initial[t.id] = t.defaultOn ?? false }))
    const [states, setStates] = useState<Record<string, boolean>>(initial)

    const toggle = (id: string) => setStates(prev => ({ ...prev, [id]: !prev[id] }))

    return (
        <div className="flex flex-col gap-6 max-w-2xl">
            <span style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 20, color: '#ffffff' }}>SETTINGS</span>

            {SECTIONS.map(section => (
                <div key={section.title} className="glass-panel p-5 flex flex-col gap-2">
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: '#a3a3a3', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: 8 }}>
                        {section.title}
                    </div>
                    {section.title === 'INTEGRATIONS' ? (
                        <div className="flex flex-col gap-0">
                            {/* Ollama row */}
                            <div className="flex items-center justify-between py-3 border-b border-[#ffffff08]">
                                <div className="flex flex-col gap-0.5">
                                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: '#e5e5e5' }}>Ollama / Qwen3 Local Model</span>
                                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: '#fb923c', letterSpacing: '1px' }}>STATUS: PENDING</span>
                                </div>
                                <span style={{
                                    fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: '#fb923c',
                                    background: '#fb923c15', border: '1px solid #fb923c30', borderRadius: 4, padding: '2px 10px', letterSpacing: '1px'
                                }}>PENDING</span>
                            </div>
                            {/* GitHub Sync row */}
                            <div className="flex items-center justify-between py-3">
                                <div className="flex flex-col gap-0.5">
                                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: '#e5e5e5' }}>GitHub Sync</span>
                                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: '#a3a3a3', letterSpacing: '1px' }}>deiharis/Nexrova-Project-Manager</span>
                                </div>
                                <span style={{
                                    fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: '#f97316',
                                    background: '#f9731615', border: '1px solid #f9731630', borderRadius: 4, padding: '2px 10px', letterSpacing: '1px',
                                    display: 'flex', alignItems: 'center', gap: 6
                                }}>
                                    <span className="animate-orange-pulse" style={{ width: 6, height: 6, borderRadius: '50%', background: '#f97316', display: 'inline-block' }}></span>
                                    CONNECTED
                                </span>
                            </div>
                        </div>
                    ) : (
                        section.toggles.map(t => (
                            <ToggleRow key={t.id} label={t.label} on={states[t.id]} onChange={() => toggle(t.id)} />
                        ))
                    )}
                </div>
            ))}
        </div>
    )
}
