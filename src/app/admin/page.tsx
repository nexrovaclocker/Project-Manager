'use client'

import { ClockPanel } from '@/components/ClockPanel'
import { NotesPanel } from '@/components/NotesPanel'
import { AdminPanel } from '@/components/AdminPanel'
import { ProjectsPanel } from '@/components/ProjectsPanel'
import { DailyLogPanel } from '@/components/DailyLogPanel'
import { DailyStatsPanel } from '@/components/DailyStatsPanel'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

const TAB_COLORS: Record<string, string> = {
    OVERVIEW: 'var(--color-brand-accent)',
    PROJECTS: 'var(--color-orange-accent)',
    DAILY_STATS: '#3b82f6',
}

function AdminContent() {
    const searchParams = useSearchParams()
    const tab = searchParams.get('tab') || 'OVERVIEW'
    const stripe = TAB_COLORS[tab] ?? TAB_COLORS.OVERVIEW

    return (
        <div className="p-6 h-full flex flex-col gap-6 overflow-y-auto scrollbar-custom relative z-10">
            {tab === 'OVERVIEW' ? (
                <>
                    <div className="flex flex-col lg:flex-row gap-6 lg:h-[500px] shrink-0">
                        {/* Top Left: Clock */}
                        <div className="w-full lg:w-1/3 flex flex-col glass-panel relative h-full overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: stripe, boxShadow: `0 0 10px ${stripe}` }}></div>
                            <ClockPanel />
                        </div>

                        {/* Top Right: Shared Notes */}
                        <div className="w-full lg:w-2/3 flex flex-col glass-panel relative h-full overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: stripe, boxShadow: `0 0 10px ${stripe}` }}></div>
                            <NotesPanel />
                        </div>
                    </div>

                    {/* Separator block */}
                    <div className="flex items-center gap-4 my-2">
                        <div className="h-px bg-gradient-to-r from-transparent via-[var(--color-orange-accent)] to-transparent flex-1 opacity-50"></div>
                        <div className="text-[var(--color-orange-accent)] font-bold tracking-widest text-sm uppercase drop-shadow-[0_0_8px_rgba(251,146,60,0.5)]">
                            // SYSTEM_MANAGEMENT
                        </div>
                        <div className="h-px bg-gradient-to-r from-transparent via-[var(--color-orange-accent)] to-transparent flex-1 opacity-50"></div>
                    </div>

                    {/* Admin Block */}
                    <div className="glass-panel relative flex-1 min-h-[400px] overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-[var(--color-orange-accent)] shadow-[0_0_10px_var(--color-orange-accent)]"></div>
                        <AdminPanel />
                    </div>
                </>
            ) : tab === 'PROJECTS' ? (
                <div className="flex-1 min-h-[600px] relative">
                    <ProjectsPanel />
                </div>
            ) : (
                <div className="flex-1 min-h-[600px] relative">
                    <DailyStatsPanel />
                </div>
            )}

            <div className="h-[300px] shrink-0 mt-2 glass-panel relative overflow-hidden">
                <DailyLogPanel />
            </div>
        </div>
    )
}

export default function AdminPage() {
    return (
        <Suspense fallback={<div className="p-6 text-[var(--color-text-secondary)] text-xs font-medium tracking-widest uppercase">LOADING_ADMIN_PANEL...</div>}>
            <AdminContent />
        </Suspense>
    )
}
