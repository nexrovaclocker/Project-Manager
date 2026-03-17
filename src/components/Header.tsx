'use client'

import { useSession, signOut } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import Image from 'next/image'
import Link from 'next/link'

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
        <div className="w-full flex items-center justify-between p-4 sticky top-0 z-50 bg-transparent border-b border-[var(--color-panel-border)]/50 shadow-[0_4px_20px_rgba(224,176,69,0.15)] backdrop-blur-md">
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
                    <div className="text-xl font-bold tracking-widest text-[var(--color-text-primary)] uppercase hidden sm:block">
                        NEXROVA<span className="text-[var(--color-brand-accent)]">_MANAGEMENT</span>
                    </div>
                </Link>

                <div className="hidden md:flex items-center gap-2 border-l border-[var(--color-panel-border)]/30 pl-8">
                    {tabs.map((t) => {
                        const isActive = tab === t
                        return (
                            <button
                                key={t}
                                onClick={() => navigate(t)}
                                className={`text-xs font-bold tracking-widest px-4 py-2 rounded-lg transition-all uppercase border-b-2 ${isActive
                                    ? 'border-[var(--color-brand-accent)] text-[var(--color-brand-accent)] bg-[var(--color-brand-accent)]/10'
                                    : 'border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-black/40 hover:-translate-y-0.5'
                                    }`}
                            >
                                {t.replace('_', ' ')}
                            </button>
                        )
                    })}
                </div>
            </div>
            <div className="flex items-center gap-4">
                <div className="text-xs font-medium tracking-widest text-[var(--color-text-secondary)] uppercase bg-black/40 px-3 py-1.5 rounded-full border border-[var(--color-panel-border)]/30">
                    <span className="text-[var(--color-brand-accent)] mr-2">●</span>
                    {session.user.username}
                </div>
                <button
                    onClick={() => signOut({ callbackUrl: '/login' })}
                    className="font-bold tracking-widest text-xs uppercase px-4 py-2 rounded-xl border border-red-400/40 text-red-500 hover:bg-red-500/10 hover:border-red-500 active:scale-95 transition-all cursor-pointer"
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
