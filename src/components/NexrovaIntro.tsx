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

        // Initial exact positioning
        gsap.set('.nx-logo-wrapper', { x: 144, yPercent: -50 })
        gsap.set('.nx-wordmark-wrapper', { x: 54, yPercent: -50 })
        gsap.set('.nx-sweep-line', { top: '50%', yPercent: -50, scaleX: 0, opacity: 0 })
        gsap.set('.nx-logo', { scale: 0.45, opacity: 0 })
        gsap.set('.nx-wordmark', { clipPath: 'inset(0% 100% 0% 0%)' })

        const tl = gsap.timeline({
            onComplete: () => {
                onComplete()
            }
        })

        // 0.2s — Radial gold glow fades in
        tl.to('.nx-radial-glow', { opacity: 1, duration: 0.8, ease: 'power2.inOut' }, 0.2)

        // 0.25s — Logo fades in & zooms up
        tl.to('.nx-logo', {
            opacity: 1,
            scale: 1,
            duration: 0.75,
            ease: 'power3.out' 
        }, 0.25)

        // 0.9s — Outer ring snaps in
        tl.fromTo('.nx-ring-outer', 
            { scale: 0.8, opacity: 0 },
            { scale: 1, opacity: 1, duration: 0.4, ease: 'back.out(1.7)', boxShadow: '0 0 20px rgba(201, 168, 76, 0.31)' },
            0.9
        )

        // 1.05s — Inner ring fades in
        tl.to('.nx-ring-inner', { opacity: 1, duration: 0.3 }, 1.05)

        // 1.1s — Logo inner details / brightness pop
        tl.to('.nx-logo', { filter: 'drop-shadow(0 0 25px rgba(201,168,76,0.6)) brightness(1.2)', duration: 0.3 }, 1.1)

        // 1.25s — Corner tick marks
        tl.to('.nx-ticks', { opacity: 1, duration: 0.3 }, 1.25)

        // 1.55s — Sweep line
        tl.to('.nx-sweep-line', {
            scaleX: 1,
            opacity: 1,
            duration: 0.4,
            ease: 'power2.out'
        }, 1.55)
        tl.to('.nx-sweep-line', {
            opacity: 0,
            duration: 0.4,
            ease: 'power2.in'
        }, 1.95)

        // 1.62s — THE SPLIT
        const splitEase = 'power3.inOut'

        tl.to('.nx-logo-wrapper', {
            x: 0,
            duration: 0.75,
            ease: splitEase
        }, 1.62)

        tl.to('.nx-wordmark-wrapper', {
            x: 0,
            duration: 0.75,
            ease: splitEase
        }, 1.62)

        tl.to('.nx-wordmark', {
            clipPath: 'inset(0% 0% 0% 0%)',
            duration: 0.75,
            ease: splitEase
        }, 1.62)

        // 2.5s — Tagline fades up
        tl.fromTo('.nx-tagline', 
            { opacity: 0, y: 10 },
            { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' },
            2.5
        )

        // 3.8s — Entire splash fades out
        tl.to(container.current, {
            opacity: 0,
            duration: 0.6,
            ease: 'power2.inOut'
        }, 3.8)

    }, { scope: container, dependencies: [isLoaded] })

    return (
        <div ref={container} className="nx-splash">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@700&display=swap');

                :root {
                    --bg-dark: #07080d;
                    --gold: #c9a84c;
                    --gold-light: #e8c76a;
                    --gold-shadow: #c9a84c80;
                    --gold-dim: #c9a84c50;
                }
                
                .nx-splash {
                    position: fixed;
                    inset: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 9999;
                    margin: 0;
                    padding: 0;
                    background: var(--bg-dark);
                    height: 100vh;
                    overflow: hidden;
                    font-family: 'Rajdhani', sans-serif;
                    background-image: repeating-linear-gradient(
                        to bottom,
                        rgba(0,0,0,0) 0%,
                        rgba(0,0,0,0) 50%,
                        rgba(0,0,0,0.2) 50%,
                        rgba(0,0,0,0.2) 100%
                    );
                    background-size: 100% 4px;
                }

                .nx-radial-glow {
                    position: absolute;
                    width: 600px;
                    height: 600px;
                    background: radial-gradient(circle, rgba(201,168,76,0.15) 0%, rgba(7,8,13,0) 70%);
                    opacity: 0;
                    pointer-events: none;
                }

                .nx-sweep-line {
                    position: absolute;
                    left: 0;
                    width: 100vw;
                    height: 1px;
                    background: linear-gradient(90deg, transparent 0%, var(--gold-light) 50%, transparent 100%);
                    opacity: 0;
                    transform: scaleX(0);
                    transform-origin: center;
                    z-index: 8;
                }

                .nx-pair {
                    position: relative;
                    width: 360px;
                    height: 160px; 
                }

                .nx-logo-wrapper {
                    position: absolute;
                    top: 50%;
                    left: 0;
                    width: 72px;
                    height: 72px;
                    z-index: 10;
                }

                .nx-ring-outer {
                    position: absolute;
                    inset: -4px;
                    border: 1px solid var(--gold-dim);
                    border-radius: 50%;
                    opacity: 0;
                }

                .nx-ring-inner {
                    position: absolute;
                    inset: 2px;
                    border: 1px dashed var(--gold-dim);
                    border-radius: 50%;
                    opacity: 0;
                    animation: nxspin 10s linear infinite;
                }

                @keyframes nxspin { 100% { transform: rotate(360deg); } }

                .nx-ticks {
                    position: absolute;
                    inset: -10px; 
                    pointer-events: none;
                    opacity: 0;
                }
                .nx-tick {
                    position: absolute;
                    width: 6px;
                    height: 6px;
                    border-color: var(--gold-dim);
                    border-style: solid;
                    border-width: 0;
                }
                .nx-tick-tl { top: 0; left: 0; border-top-width: 1px; border-left-width: 1px; }
                .nx-tick-tr { top: 0; right: 0; border-top-width: 1px; border-right-width: 1px; }
                .nx-tick-bl { bottom: 0; left: 0; border-bottom-width: 1px; border-left-width: 1px; }
                .nx-tick-br { bottom: 0; right: 0; border-bottom-width: 1px; border-right-width: 1px; }

                .nx-logo {
                    width: 100%;
                    height: 100%;
                    object-fit: contain;
                    filter: drop-shadow(0 0 14px var(--gold-dim));
                    opacity: 0; 
                }

                .nx-wordmark-wrapper {
                    position: absolute;
                    top: 50%;
                    left: 90px;
                    z-index: 5;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                }

                .nx-wordmark {
                    font-size: 52px;
                    letter-spacing: 10px;
                    color: var(--gold);
                    text-shadow: 0 0 30px var(--gold-shadow);
                    text-transform: uppercase;
                    line-height: 1;
                    margin: 0;
                    padding: 0;
                    white-space: nowrap;
                }

                .nx-tagline {
                    font-family: 'Rajdhani', sans-serif;
                    font-size: 9px;
                    letter-spacing: 5px;
                    color: var(--gold-dim);
                    text-transform: uppercase;
                    margin-top: 4px;
                    opacity: 0;
                    padding-left: 4px;
                }
            `}</style>
            
            <div className="nx-radial-glow"></div>
            <div className="nx-sweep-line" id="sweep"></div>
            
            <div className="nx-pair">
                <div className="nx-logo-wrapper">
                    <div className="nx-ring-outer"></div>
                    <div className="nx-ring-inner"></div>
                    <div className="nx-ticks">
                        <div className="nx-tick nx-tick-tl"></div>
                        <div className="nx-tick nx-tick-tr"></div>
                        <div className="nx-tick nx-tick-bl"></div>
                        <div className="nx-tick nx-tick-br"></div>
                    </div>
                    {/* Using Next.js Image Component */}
                    <div className="nx-logo relative w-full h-full">
                        <Image
                            src="/logo.jpeg"
                            alt="NEXROVA Logo"
                            fill
                            className="object-contain"
                            style={{ mixBlendMode: 'screen' }}
                            priority
                            onLoad={() => setIsLoaded(true)}
                        />
                    </div>
                </div>

                <div className="nx-wordmark-wrapper">
                    <div className="nx-wordmark">NEXROVA</div>
                    <div className="nx-tagline">COMMAND PLATFORM</div>
                </div>
            </div>
        </div>
    )
}
