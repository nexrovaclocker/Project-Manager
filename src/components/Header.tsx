'use client'

import { useSession, signOut } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

function HeaderContent() {
    const { data: session } = useSession()
    const searchParams = useSearchParams()
    const tab = searchParams.get('tab') || 'OVERVIEW'

    const [onlineCount, setOnlineCount] = useState(0)

    useEffect(() => {
        const fetchOnlineCount = async () => {
            const { count } = await supabase
                .from('User')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'online')
            
            if (count !== null) setOnlineCount(count)
        }
        fetchOnlineCount()

        const sub = supabase.channel('header_online_users')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'User' }, () => {
                fetchOnlineCount()
            })
            .subscribe()

        return () => {
            supabase.removeChannel(sub)
        }
    }, [])

    if (!session) return null

    const isAdmin = (session.user as any).role?.toUpperCase() === 'ADMIN' || (session.user as any).role === 'ADMIN'
    const tabs = ['OVERVIEW', 'LIVE_STATUS', 'PROJECTS', 'DAILY_STATS', ...(isAdmin ? ['MEMBERS', 'SETTINGS'] : [])]

    const navigate = (t: string) => {
        const params = new URLSearchParams(window.location.search)
        params.set('tab', t)
        window.history.replaceState(null, '', `?${params.toString()}`)
        window.dispatchEvent(new Event('popstate'))
    }

    return (
        <div className="w-full flex items-center justify-between p-4 sticky top-0 z-50 bg-transparent border-b border-[var(--color-panel-border)]/50 shadow-indigo backdrop-blur-md">
            <div className="flex items-center gap-8">
                <Link href="/dashboard" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                    <Image 
                        src="/logo.jpeg" 
                        alt="Nexrova Logo" 
                        width={40} 
                        height={40} 
                        className="h-10 w-auto object-contain rounded mix-blend-mode: screen"
                        priority
                    />
                    <div className="text-xl font-bold tracking-widest text-white uppercase hidden sm:block">
                        NEXROVA<span className="text-[#f97316]">_MANAGEMENT</span>
                    </div>
                </Link>

                <div className="hidden md:flex items-center gap-2 border-l border-[#f97316]/30 pl-8">
                    {tabs.map((t) => {
                        const isActive = tab === t
                        return (
                            <button
                                key={t}
                                onClick={() => navigate(t)}
                                className={`font-['JetBrains_Mono'] text-[10px] tracking-[1.5px] font-bold px-4 py-2 rounded-lg transition-all uppercase border-b-2 flex items-center gap-2 ${isActive
                                    ? 'border-[#f97316] text-[#ffffff] bg-[#f97316]/20'
                                    : 'border-transparent text-[#94A3B8] hover:text-[#ffffff] hover:bg-white/5 hover:-translate-y-0.5'
                                    }`}
                            >
                                {t === 'LIVE_STATUS' && (
                                    <span className="flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#f97316] animate-orange-pulse"></span>
                                        <span className="bg-[#f97316]/20 text-[#f97316] px-1.5 py-0.5 rounded text-[9px] font-black">{onlineCount}</span>
                                    </span>
                                )}
                                {t.replace('_', ' ')}
                            </button>
                        )
                    })}
                </div>
            </div>
            <div className="flex items-center gap-4">
                <div className="text-xs font-medium tracking-widest text-[#94A3B8] uppercase bg-white/5 px-3 py-1.5 rounded-full border border-[#f97316]/30">
                    <span className="text-[#f97316] mr-2">●</span>
                    {session.user.username}
                </div>
                <button
                    onClick={() => signOut({ callbackUrl: '/login' })}
                    className="font-bold tracking-widest text-[10px] uppercase px-4 py-2 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500 active:scale-95 transition-all cursor-pointer"
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
