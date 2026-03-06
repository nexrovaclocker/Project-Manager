'use client'

import { useSession, signOut } from 'next-auth/react'

export function Header() {
    const { data: session } = useSession()

    if (!session) return null

    return (
        <div className="w-full flex items-center justify-between p-4 border-b border-[var(--color-panel-border)] bg-[var(--color-bg-dark)]">
            <div className="text-xl font-bold tracking-widest text-[var(--color-green-accent)] uppercase">
                NEXROVA_PROJECT_MANAGER
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
