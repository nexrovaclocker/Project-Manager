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

        // Phase 1: Logo Reveal (Start 0.8x, scale to 1.1x with indigo glow)
        tl.fromTo('.nxi-logo-box',
            { opacity: 0, scale: 0.8 },
            {
                opacity: 1,
                scale: 1.1,
                duration: 2.5,
                ease: 'power2.out',
                clearProps: 'filter' // We'll handle glow via CSS to avoid conflict
            }
        )

        // Phase 2: Shift Left & Text Fade
        tl.to('.nxi-logo-box', {
            x: -200,
            duration: 1.2,
            ease: 'power3.inOut'
        }, "+=0.2")

        tl.fromTo('.nxi-text-box',
            { opacity: 0, x: 50 },
            { 
                opacity: 1, 
                x: -160, // Align next to the shifted logo
                duration: 1.2, 
                ease: 'power3.out' 
            },
            "<"
        )

        // Hold for a beat
        tl.to({}, { duration: 1.5 })

    }, { scope: container, dependencies: [isLoaded] })

    return (
        <div
            ref={container}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black"
        >
            <style>{`
                .nxi-logo-box {
                    width: 130px;
                    height: 130px;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    position: relative;
                    z-index: 10;
                    box-shadow: 0 0 30px rgba(99,102,241,0.4);
                    border-radius: 50%;
                }
                .nxi-logo-img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    border-radius: 50%;
                    mix-blend-mode: screen;
                }
                .nxi-text-box {
                    position: absolute;
                    display: flex;
                    align-items: center;
                }
                .nxi-text-content {
                    font-size: 72px;
                    font-weight: 700;
                    letter-spacing: 12px;
                    color: #E0B045; /* GOLD Signature */
                    margin: 0;
                    white-space: nowrap;
                    line-height: 1;
                }
            `}</style>

            <div className="relative flex items-center justify-center w-full max-w-4xl">
                <div className="nxi-logo-box">
                    <Image
                        src="/logo.jpeg"
                        alt="NEXROVA Logo"
                        width={130}
                        height={130}
                        className="nxi-logo-img"
                        priority
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
