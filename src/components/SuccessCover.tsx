'use client'

import { motion, AnimatePresence } from 'framer-motion'

export default function SuccessCover({ onComplete }: { onComplete: () => void }) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onAnimationComplete={() => {
                // We'll manually trigger onComplete after the tick finishes
            }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black"
        >
            <div className="relative flex flex-col items-center">
                <svg
                    width="120"
                    height="120"
                    viewBox="0 0 120 120"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="drop-shadow-[0_0_15px_rgba(99,102,241,0.8)]"
                >
                    <motion.path
                        d="M30 60L50 80L90 40"
                        stroke="#6366F1"
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ 
                            duration: 1.2, 
                            ease: "easeInOut",
                            delay: 0.3
                        }}
                        onAnimationComplete={() => {
                            setTimeout(onComplete, 800)
                        }}
                    />
                </svg>
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.2 }}
                    className="mt-6 text-[#6366F1] font-bold tracking-[0.2em] uppercase text-sm"
                >
                    Access_Granted
                </motion.div>
            </div>
        </motion.div>
    )
}
