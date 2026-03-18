'use client'

import { useState, useEffect } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import NexrovaIntro from '@/components/NexrovaIntro'
import SuccessCover from '@/components/SuccessCover'

export default function LoginPage() {
    const router = useRouter()
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [revealDone, setRevealDone] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)

    useEffect(() => {
        const handleReveal = () => setRevealDone(true)
        window.addEventListener('revealComplete', handleReveal)
        return () => window.removeEventListener('revealComplete', handleReveal)
    }, [])

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
            setError('Invalid access credentials')
            setLoading(false)
        } else {
            // SUCCESS FLOW
            setIsSuccess(true)
        }
    }

    const handleSuccessComplete = () => {
        router.push('/')
        router.refresh()
    }

    return (
        <div className="relative min-h-screen bg-black overflow-hidden">
            {!revealDone && <NexrovaIntro />}

            <AnimatePresence>
                {isSuccess && (
                    <SuccessCover key="success" onComplete={handleSuccessComplete} />
                )}
            </AnimatePresence>

            <motion.div 
                initial={false}
                animate={{ opacity: revealDone ? 1 : 0 }}
                transition={{ duration: 0.4 }}
                style={{ visibility: revealDone ? 'visible' : 'hidden' }}
                className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8"
            >
                <div className="max-w-md w-full space-y-8 relative z-10">
                    <div className="text-center">
                        <motion.h2 
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="text-3xl font-extrabold tracking-[0.3em] text-white uppercase"
                        >
                            Nexrova<span className="text-[#6366F1]">_</span>OS
                        </motion.h2>
                        <p className="mt-2 text-xs font-semibold tracking-widest text-[#94A3B8] uppercase">
                            Operational Interface v5.0
                        </p>
                    </div>

                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        <div className="glass-panel p-8 space-y-6">
                            {error && (
                                <motion.div 
                                    initial={{ scale: 0.95, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="text-red-400 text-xs font-bold tracking-widest border border-red-500/30 bg-red-500/10 p-3 rounded-xl text-center uppercase"
                                >
                                    [ERR] {error}
                                </motion.div>
                            )}
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[10px] font-bold text-[#94A3B8] uppercase tracking-[0.2em] mb-2 px-1">
                                        Identification_ID
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        className="glass-input"
                                        placeholder="Enter Username"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-[#94A3B8] uppercase tracking-[0.2em] mb-2 px-1">
                                        Security_Key
                                    </label>
                                    <input
                                        type="password"
                                        required
                                        className="glass-input"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="glass-button w-full py-3.5 tracking-[0.2em] text-sm"
                            >
                                {loading ? 'AUTHENTICATING...' : 'INITIATE_SESSION'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Decorative Background Elements */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#6366F1]/5 blur-[120px] rounded-full pointer-events-none"></div>
            </motion.div>
        </div>
    )
}
