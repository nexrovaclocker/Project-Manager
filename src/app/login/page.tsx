'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import NexrovaIntro from '@/components/NexrovaIntro'

export default function LoginPage() {
    const router = useRouter()
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [showIntro, setShowIntro] = useState(true)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        const result = await signIn('credentials', {
            redirect: false,
            username,
            password,
        })

        if (result?.error) {
            setError('Invalid username or password')
            setLoading(false)
        } else {
            router.push('/')
            router.refresh()
        }
    }

    return (
        <>
            {showIntro && <NexrovaIntro onComplete={() => setShowIntro(false)} />}

            <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg-dark)] px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8">
                    <div>
                        <h2 className="mt-6 text-center text-3xl tracking-tight font-bold text-[var(--color-text-primary)]">
                            NEXROVA PROJECT MANAGER
                        </h2>
                    </div>
                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        <div className="border border-[var(--color-panel-border)]/40 bg-[var(--color-panel)] p-6 space-y-6 rounded-2xl overflow-hidden shadow-sm">
                            {error && (
                                <div className="text-red-600 text-sm font-semibold border border-red-400/50 bg-red-50 p-2 rounded-lg">
                                    [ERROR] {error}
                                </div>
                            )}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider mb-1">
                                        &gt; Username
                                    </label>
                                    <input
                                        id="username"
                                        name="username"
                                        type="text"
                                        required
                                        className="glass-input w-full"
                                        placeholder="admin"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider mb-1">
                                        &gt; Password
                                    </label>
                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        required
                                        className="glass-input w-full"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="glass-button w-full flex justify-center py-2.5 disabled:opacity-50 transition-colors duration-200"
                                >
                                    {loading ? 'AUTHENTICATING...' : 'INITIATE_LOGIN_SEQ'}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </>
    )
}
