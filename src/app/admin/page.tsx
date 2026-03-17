'use client'

import { ClockPanel } from '@/components/ClockPanel'
import { NotesPanel } from '@/components/NotesPanel'
import { AdminPanel } from '@/components/AdminPanel'
import { ProjectsPanel } from '@/components/ProjectsPanel'
import { DailyLogPanel } from '@/components/DailyLogPanel'
import { DailyStatsPanel } from '@/components/DailyStatsPanel'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function AdminContent() {
    const searchParams = useSearchParams()
    const tab = searchParams.get('tab') || 'OVERVIEW'

    return (
        <div className="p-6 h-full flex flex-col gap-6 overflow-y-auto scrollbar-custom relative z-10">
            {tab === 'OVERVIEW' ? (
                <>
                    <div className="flex flex-col lg:flex-row gap-6 lg:h-[500px] shrink-0">
                        {/* Top Left: Clock */}
                        <div className="w-full lg:w-1/3 flex flex-col glass-panel relative h-full overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-[#6366F1] shadow-[0_0_10px_#6366F1] z-20"></div>
                            <ClockPanel />
                        </div>

                        {/* Top Right: Shared Notes */}
                        <div className="w-full lg:w-2/3 flex flex-col glass-panel relative h-full overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-[#6366F1] shadow-[0_0_10px_#6366F1] z-20"></div>
                            <NotesPanel />
                        </div>
                    </div>

                    {/* Separator block */}
                    <div className="flex items-center gap-6 my-4">
                        <div className="h-px bg-gradient-to-r from-transparent via-[#6366F1]/30 to-transparent flex-1"></div>
                        <div className="text-[#6366F1] font-bold tracking-[0.2em] text-[10px] uppercase">
                            // CORE_SYSTEM_ORCHESTRATION
                        </div>
                        <div className="h-px bg-gradient-to-r from-transparent via-[#6366F1]/30 to-transparent flex-1"></div>
                    </div>

                    {/* Admin Block */}
                    <div className="glass-panel relative flex-1 min-h-[400px] overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-[#6366F1] shadow-[0_0_10px_#6366F1] z-20"></div>
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

            <div className="h-[300px] shrink-0 mt-6 glass-panel relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-[#6366F1] shadow-[0_0_10px_#6366F1] z-20"></div>
                <DailyLogPanel />
            </div>
        </div>
    )
}

export default function AdminPage() {
    return (
        <Suspense fallback={<div className="p-8 text-[#94A3B8] text-[10px] font-bold tracking-[0.2em] uppercase animate-pulse">Initializing_Root_Environment...</div>}>
            <AdminContent />
        </Suspense>
    )
}
