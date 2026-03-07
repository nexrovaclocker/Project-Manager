'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'

export function Header() {
    const { data: session } = useSession()

    if (!session) return null

    return (
        <div className="w-full flex items-center justify-between p-4 border-b border-[var(--color-panel-border)] bg-[var(--color-bg-dark)]">
            <div className="flex items-center gap-8">
                <div className="text-xl font-bold tracking-widest text-[var(--color-green-accent)] uppercase">
                    NEXROVA_PROJECT_MANAGER
                </div>

                <div className="hidden md:flex items-center gap-4 border-l border-[var(--color-panel-border)] pl-8">
                    <button
                        onClick={() => {
                            const params = new URLSearchParams(window.location.search)
                            params.set('tab', 'OVERVIEW')
                            window.history.replaceState(null, '', `?${params.toString()}`)
                            window.dispatchEvent(new Event('popstate')) // trigger next.js re-render if client side, or better yet useRouter
                        }}
                        className={`text-xs font-bold tracking-widest px-3 py-1 transition-colors uppercase border ${(!window?.location?.search?.includes('tab=PROJECTS')) ? 'border-[var(--color-green-accent)] text-[var(--color-green-accent)]' : 'border-transparent text-[var(--color-text-secondary)] hover:text-white'}`}
                    >
                        OVERVIEW
                    </button>
                    <button
                        onClick={() => {
                            const params = new URLSearchParams(window.location.search)
                            params.set('tab', 'PROJECTS')
                            window.history.replaceState(null, '', `?${params.toString()}`)
                            window.dispatchEvent(new Event('popstate'))
                        }}
                        className={`text-xs font-bold tracking-widest px-3 py-1 transition-colors uppercase border ${(window?.location?.search?.includes('tab=PROJECTS')) ? 'border-[var(--color-green-accent)] text-[var(--color-green-accent)]' : 'border-transparent text-[var(--color-text-secondary)] hover:text-white'}`}
                    >
                        PROJECTS
                    </button>
                    <button
                        onClick={() => {
                            const params = new URLSearchParams(window.location.search)
                            params.set('tab', 'DAILY_STATS')
                            window.history.replaceState(null, '', `?${params.toString()}`)
                            window.dispatchEvent(new Event('popstate'))
                        }}
                        className={`text-xs font-bold tracking-widest px-3 py-1 transition-colors uppercase border ${(window?.location?.search?.includes('tab=DAILY_STATS')) ? 'border-[var(--color-green-accent)] text-[var(--color-green-accent)]' : 'border-transparent text-[var(--color-text-secondary)] hover:text-white'}`}
                    >
                        DAILY_STATS
                    </button>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <div className="text-xs tracking-widest text-[var(--color-text-secondary)] uppercase">
                    USER: {session.user.username}
                </div>
                <button
                    onClick={() => signOut({ callbackUrl: '/login' })}
                    className="text-xs font-bold tracking-widest px-3 py-1 border border-[var(--color-panel-border)] hover:border-red-500 hover:text-red-500 transition-colors text-[var(--color-text-secondary)] uppercase"
                >
                    LOGOUT
                </button>
            </div>
        </div>
    )
}
