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

    return (
        <div className="h-full flex flex-col p-6 gap-6 overflow-hidden">
            <div className="flex-1 flex flex-col lg:flex-row gap-6 overflow-hidden">
                {tab === 'OVERVIEW' ? (
                    <>
                        {/* Left Panel: Clock */}
                        <div className="w-full lg:w-1/3 flex flex-col border border-[var(--color-panel-border)] bg-[var(--color-panel)] relative h-full">
                            <div className="absolute top-0 left-0 w-full h-1 bg-[var(--color-panel-border)]"></div>
                            <ClockPanel />
                        </div>

                        {/* Right Panel: Shared Notes */}
                        <div className="w-full lg:w-2/3 flex flex-col border border-[var(--color-panel-border)] bg-[var(--color-panel)] relative h-full">
                            <div className="absolute top-0 left-0 w-full h-1 bg-[var(--color-panel-border)]"></div>
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

            <div className="h-[300px] shrink-0 w-full">
                <DailyLogPanel />
            </div>
        </div>
    )
}

export default function DashboardPage() {
    return (
        <Suspense fallback={<div className="p-6 text-[var(--color-text-secondary)] text-xs tracking-widest uppercase">LOADING_DASHBOARD...</div>}>
            <DashboardContent />
        </Suspense>
    )
}
