'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(useGSAP)

export default function NexrovaIntro({ onComplete }: { onComplete: () => void }) {
    const container = useRef<HTMLDivElement>(null)
    const [isLoaded, setIsLoaded] = useState(false)

    useGSAP(() => {
        if (!isLoaded) return

        const tl = gsap.timeline({
            onComplete: () => {
                // Phase 5: Clean up (unmount component when finished)
                gsap.to(container.current, {
                    opacity: 0,
                    duration: 0.8,
                    ease: 'power2.inOut',
                    onComplete: () => {
                        onComplete()
                    }
                })
            }
        })

        // Phase 2: The Zoom & Glow (0s - 2.5s)
        // Starts with opacity: 0 and scale: 0.8 -> fades to 1 and scales to 1.1
        tl.fromTo('.nxi-logo-box',
            { opacity: 0, scale: 0.8 },
            {
                opacity: 1,
                scale: 1.1,
                duration: 2.5,
                ease: 'power2.out',
            }
        )

        // Phase 3: The Dual-Direction Slide (2.5s - 4s)
        tl.to('.nxi-logo-box', {
            x: -180, // Slide smoothly to the LEFT
            duration: 1.5,
            ease: 'easeInOut' // Use exact easing requested
        }, 2.5) // Starts at 2.5s

        // Text 'NEXROVA' emerges from center and moves to the RIGHT
        // With a 'wipe' clip-path reveal
        tl.fromTo('.nxi-text-box',
            { x: -40, clipPath: 'inset(0% 100% 0% 0%)' },
            { 
                x: 120, // Move smoothly to the RIGHT
                clipPath: 'inset(0% 0% 0% 0%)', // Pull out from behind logo
                duration: 1.5, 
                ease: 'easeInOut' 
            },
            2.5
        )

        // Hold for a moment so user can read it
        tl.to({}, { duration: 1.2 })

    }, { scope: container, dependencies: [isLoaded] })

    // Phase 1: Initial Centering on Black background (#000000)
    return (
        <div
            ref={container}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            style={{ backgroundColor: '#000000' }}
        >
            <style>{`
                .nxi-logo-box {
                    width: 140px;
                    height: 140px;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    position: absolute; /* Ensures it is absolute center */
                    z-index: 10;
                    border-radius: 50%;
                    /* Soft pulsing Indigo outer glow */
                    animation: pulseIndigoGlow 2s ease-in-out infinite alternate;
                }
                @keyframes pulseIndigoGlow {
                    0% { box-shadow: 0 0 10px rgba(99, 102, 241, 0.4); }
                    100% { box-shadow: 0 0 35px rgba(99, 102, 241, 0.9); }
                }
                .nxi-logo-img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    border-radius: 50%;
                }
                .nxi-text-box {
                    position: absolute;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 5;
                }
                .nxi-text-content {
                    font-family: inherit;
                    font-size: 72px;
                    font-weight: 700;
                    letter-spacing: 12px;
                    /* Font must be Gold */
                    color: #E0B045; 
                    margin: 0;
                    white-space: nowrap;
                    line-height: 1;
                }
            `}</style>

            <div className="relative flex items-center justify-center w-full max-w-5xl h-full">
                <div className="nxi-logo-box">
                    {/* Image path exactly as requested, with mixBlendMode: 'screen' */}
                    <Image
                        src="/logo.jpeg"
                        alt="NEXROVA Logo"
                        width={200}
                        height={200}
                        className="nxi-logo-img"
                        priority
                        style={{ mixBlendMode: 'screen' }}
                        onLoad={() => setIsLoaded(true)}
                    />
                </div>

                <div className="nxi-text-box">
                    <h1 className="nxi-text-content">NEXROVA</h1>
                </div>
            </div>
        </div>
    )
}
