'use client'

import { useSession, signOut } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import Image from 'next/image'
import Link from 'next/link'

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
        <div className="w-full flex items-center justify-between p-4 sticky top-0 z-50 bg-[#09090b]/40 backdrop-blur-xl border-b border-[var(--color-panel-border)] shadow-sm">
            <div className="flex items-center gap-8">
                <Link href="/dashboard" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                    <Image 
                        src="/logo.jpeg" 
                        alt="Nexrova Logo" 
                        width={40} 
                        height={40} 
                        className="h-10 w-auto object-contain rounded"
                        priority
                    />
                    <div className="text-xl font-bold tracking-widest text-white tracking-widest uppercase hidden sm:block drop-shadow-md">
                        NEXROVA<span className="text-[var(--color-brand-accent)]">_MANAGEMENT</span>
                    </div>
                </Link>

                <div className="hidden md:flex items-center gap-2 border-l border-[var(--color-panel-border)] pl-8">
                    {tabs.map((t) => {
                        const isActive = tab === t
                        const color = TAB_COLORS[t]
                        return (
                            <button
                                key={t}
                                onClick={() => navigate(t)}
                                style={isActive ? { backgroundColor: `${color}15`, color, borderBottomColor: color } : {}}
                                className={`text-xs font-bold tracking-widest px-4 py-2 rounded-lg transition-all uppercase border-b-2 ${isActive
                                        ? 'border-b-current shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]'
                                        : 'border-transparent text-[var(--color-text-secondary)] hover:text-white hover:bg-white/5 hover:-translate-y-0.5'
                                    }`}
                            >
                                {t.replace('_', ' ')}
                            </button>
                        )
                    })}
                </div>
            </div>
            <div className="flex items-center gap-4">
                <div className="text-xs font-medium tracking-widest text-[var(--color-text-secondary)] uppercase bg-black/20 px-3 py-1.5 rounded-full border border-white/5">
                    <span className="text-[var(--color-brand-accent)] mr-2">●</span>
                    {session.user.username}
                </div>
                <button
                    onClick={() => signOut({ callbackUrl: '/login' })}
                    className="glass-button text-[var(--color-text-secondary)] hover:text-red-400 hover:border-red-500/50 hover:bg-red-500/10"
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
