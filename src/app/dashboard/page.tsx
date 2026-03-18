'use client'

import { ClockPanel } from '@/components/ClockPanel'
import { NotesPanel } from '@/components/NotesPanel'
import { ProjectsPanel } from '@/components/ProjectsPanel'
import { DailyLogPanel } from '@/components/DailyLogPanel'
import { DailyStatsPanel } from '@/components/DailyStatsPanel'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function DashboardContent() {
    const searchParams = useSearchParams()
    const tab = searchParams.get('tab') || 'OVERVIEW'
    const stripe = 'var(--color-brand-accent)'

    return (
        <div className="min-h-full flex flex-col p-6 gap-6 relative z-10">
            <div className="flex flex-col lg:flex-row gap-6">
                {tab === 'OVERVIEW' ? (
                    <>
                        {/* Left Panel: Clock */}
                        <div className="w-full lg:w-1/3 flex flex-col glass-panel relative h-full overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-[#f97316] shadow-[0_0_10px_#f97316] z-20"></div>
                            <ClockPanel />
                        </div>

                        {/* Right Panel: Shared Notes */}
                        <div className="w-full lg:w-2/3 flex flex-col glass-panel relative h-full overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-[#f97316] shadow-[0_0_10px_#f97316] z-20"></div>
                            <NotesPanel />
                        </div>
                    </>
                ) : tab === 'PROJECTS' ? (
                    <div className="w-full h-full relative">
                        <ProjectsPanel />
                    </div>
                ) : (
                    <div className="w-full h-full relative">
                        <DailyStatsPanel />
                    </div>
                )}
            </div>

            <div className="h-[300px] shrink-0 w-full glass-panel relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-[#f97316] shadow-[0_0_10px_#f97316] z-20"></div>
                <DailyLogPanel />
            </div>
        </div>
    )
}

export default function DashboardPage() {
    return (
        <Suspense fallback={<div className="p-8 text-[#94A3B8] text-[10px] font-bold tracking-[0.2em] uppercase animate-pulse">Initializing_Dashboard_Stream...</div>}>
            <DashboardContent />
        </Suspense>
    )
}
