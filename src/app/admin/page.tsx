'use client'

import { OverviewTab } from '@/components/OverviewTab'
import { LiveStatusTab } from '@/components/LiveStatusTab'
import { ProjectsPanel } from '@/components/ProjectsPanel'
import { DailyStatsTab } from '@/components/DailyStatsTab'
import { DailyLogPanel } from '@/components/DailyLogPanel'
import { MembersTab } from '@/components/MembersTab'
import { SettingsTab } from '@/components/SettingsTab'
import { useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Suspense } from 'react'

function AdminContent() {
    const searchParams = useSearchParams()
    const tab = searchParams.get('tab') || 'OVERVIEW'
    const { data: session } = useSession()
    const isAdmin = (session?.user as any)?.role?.toUpperCase() === 'ADMIN'

    const renderTab = () => {
        switch (tab) {
            case 'OVERVIEW':
                return <OverviewTab />
            case 'LIVE_STATUS':
                return <LiveStatusTab />
            case 'PROJECTS':
                return (
                    <div className="flex-1 min-h-[600px] relative">
                        <ProjectsPanel />
                    </div>
                )
            case 'DAILY_STATS':
                return <DailyStatsTab />
            case 'MEMBERS':
                return isAdmin ? <MembersTab /> : <AccessDenied />
            case 'SETTINGS':
                return isAdmin ? <SettingsTab /> : <AccessDenied />
            default:
                return <OverviewTab />
        }
    }

    return (
        <div className="p-6 min-h-full flex flex-col gap-6 relative z-10">
            {renderTab()}

            {/* Daily Log strip at the bottom - always visible */}
            {(tab === 'OVERVIEW' || tab === 'PROJECTS') && (
                <div className="h-[300px] shrink-0 glass-panel relative overflow-hidden">
                    <DailyLogPanel />
                </div>
            )}
        </div>
    )
}

function AccessDenied() {
    return (
        <div className="flex items-center justify-center py-24">
            <div className="glass-panel p-8 text-center max-w-sm">
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: '#f97316', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: 8 }}>
                    ACCESS_DENIED
                </div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: '#555555' }}>
                    ADMIN_CLEARANCE_REQUIRED
                </div>
            </div>
        </div>
    )
}

export default function AdminPage() {
    return (
        <Suspense fallback={<div className="p-8 text-[#a3a3a3] text-[10px] font-bold tracking-[0.2em] uppercase animate-pulse" style={{ fontFamily: "'JetBrains Mono', monospace" }}>INITIALIZING_ROOT_ENVIRONMENT...</div>}>
            <AdminContent />
        </Suspense>
    )
}
