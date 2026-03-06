'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
    const router = useRouter()
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

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
        <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg-dark)] px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl tracking-tight font-bold text-[var(--color-text-primary)]">
                        NEXROVA_PROJECT_MANAGER
                    </h2>
                    <p className="mt-2 text-center text-sm text-[var(--color-text-secondary)] tracking-widest">
                        // OPERATIONAL DASHBOARD
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="border border-[var(--color-panel-border)] bg-[var(--color-panel)] p-6 space-y-6">
                        {error && (
                            <div className="text-red-500 text-sm font-semibold border border-red-500/50 bg-red-500/10 p-2">
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
                                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-[var(--color-panel-border)] bg-[var(--color-bg-dark)] text-[var(--color-text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-green-accent)] focus:border-[var(--color-green-accent)] focus:z-10 sm:text-sm"
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
                                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-[var(--color-panel-border)] bg-[var(--color-bg-dark)] text-[var(--color-text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-green-accent)] focus:border-[var(--color-green-accent)] focus:z-10 sm:text-sm"
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
                                className="group relative w-full flex justify-center py-2 px-4 border border-[var(--color-green-accent)] text-sm font-bold uppercase tracking-wider text-[var(--color-bg-dark)] bg-[var(--color-green-accent)] hover:bg-transparent hover:text-[var(--color-green-accent)] focus:outline-none disabled:opacity-50 transition-colors duration-200"
                            >
                                {loading ? 'AUTHENTICATING...' : 'INITIATE_LOGIN_SEQ'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    )
}
