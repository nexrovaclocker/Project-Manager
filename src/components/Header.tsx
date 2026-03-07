'use client'

import { useSession, signOut } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

// Per-tab accent colours
const TAB_COLORS: Record<string, string> = {
    OVERVIEW: 'var(--color-brand-accent)',   // teal
    PROJECTS: 'var(--color-orange-accent)',  // orange
    DAILY_STATS: '#3b82f6',                    // blue
}

function HeaderContent() {
    const { data: session } = useSession()
    const searchParams = useSearchParams()
    const tab = searchParams.get('tab') || 'OVERVIEW'

    if (!session) return null

    const tabs = ['OVERVIEW', 'PROJECTS', 'DAILY_STATS'] as const

    const navigate = (t: string) => {
        const params = new URLSearchParams(window.location.search)
        params.set('tab', t)
        window.history.replaceState(null, '', `?${params.toString()}`)
        window.dispatchEvent(new Event('popstate'))
    }

    return (
        <div className="w-full flex items-center justify-between p-4 border-b border-[var(--color-panel-border)] bg-[var(--color-bg-dark)]">
            <div className="flex items-center gap-8">
                <div className="text-xl font-bold tracking-widest text-[var(--color-brand-accent)] uppercase">
                    NEXROVA_PROJECT_MANAGER
                </div>

                <div className="hidden md:flex items-center gap-4 border-l border-[var(--color-panel-border)] pl-8">
                    {tabs.map((t) => {
                        const isActive = tab === t
                        const color = TAB_COLORS[t]
                        return (
                            <button
                                key={t}
                                onClick={() => navigate(t)}
                                style={isActive ? { color, borderBottomColor: color } : {}}
                                className={`text-xs font-bold tracking-widest px-3 py-1 transition-colors uppercase border-b-2 ${isActive
                                        ? 'border-b-current'
                                        : 'border-transparent text-[var(--color-text-secondary)] hover:text-white hover:bg-[var(--color-panel)]'
                                    }`}
                            >
                                {t.replace('_', '\u00a0')}
                            </button>
                        )
                    })}
                </div>
            </div>
            <div className="flex items-center gap-4">
                <div className="text-xs tracking-widest text-[var(--color-text-secondary)] uppercase">
                    USER: {session.user.username}
                </div>
                <button
                    onClick={() => signOut({ callbackUrl: '/login' })}
                    className="text-xs font-bold tracking-widest px-3 py-1 border border-[var(--color-panel-border)] hover:bg-red-500 hover:border-red-500 hover:text-white transition-colors text-[var(--color-text-secondary)] uppercase rounded-xl"
                >
                    LOGOUT
                </button>
            </div>
        </div>
    )
}

export function Header() {
    return (
        <Suspense fallback={null}>
            <HeaderContent />
        </Suspense>
    )
}
