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

        // Phase 1 (0s-2.5s): Fade in + Cinematic Zoom 0.8x → 1.2x
        tl.fromTo('.nxi-logo-box',
            { opacity: 0, scale: 0.8 },
            {
                opacity: 1,
                scale: 1.2,
                duration: 2.5,
                ease: 'power2.inOut'
            },
            0
        )

        // Ignite: White → Gold bloom glow
        tl.to('.nxi-glow-layer', {
            opacity: 0.9,
            duration: 1.2,
            ease: 'power1.inOut',
        }, 1.3)

        // Infinite pulse on the glow
        tl.add(() => {
            gsap.to('.nxi-glow-layer', {
                opacity: 1,
                filter: 'blur(20px)',
                scale: 1.04,
                duration: 1.25,
                yoyo: true,
                repeat: -1,
                ease: 'sine.inOut'
            })
        }, 2.5)

        // Phase 2 (2.5s-4s): Logo settles to 1.0x while sliding left
        tl.to('.nxi-logo-box', {
            scale: 1.0,
            duration: 1.5,
            ease: 'power3.inOut'
        }, 2.5)

        // Phase 3: Text wipe-reveal from behind logo's right edge
        tl.fromTo('.nxi-text-box',
            {
                marginLeft: 0,
                clipPath: 'inset(0 100% 0 0)',
                webkitClipPath: 'inset(0 100% 0 0)'
            },
            {
                marginLeft: 40,
                clipPath: 'inset(0 0% 0 0)',
                webkitClipPath: 'inset(0 0% 0 0)',
                duration: 1.5,
                ease: 'power3.inOut'
            },
            2.5
        )

        // Phase 4: Hold centered group for a cinematic beat
        tl.to({}, { duration: 1.8 })

    }, { scope: container, dependencies: [isLoaded] })

    return (
        <div
            ref={container}
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ background: '#F8F9F1' }}
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
                    opacity: 0;
                    transform: scale(0.8);
                    border-radius: 20px;
                }
                .nxi-glow-layer {
                    position: absolute;
                    top: -8px; right: -8px; bottom: -8px; left: -8px;
                    background: linear-gradient(135deg, #ffffff 0%, #E0B045 100%);
                    z-index: -1;
                    border-radius: inherit;
                    filter: blur(16px);
                    opacity: 0;
                }
                .nxi-logo-img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    border-radius: inherit;
                    z-index: 2;
                    position: relative;
                }
                .nxi-text-box {
                    display: flex;
                    align-items: center;
                    margin-left: 0;
                    clip-path: inset(0 100% 0 0);
                    -webkit-clip-path: inset(0 100% 0 0);
                }
                .nxi-text-content {
                    font-size: 84px;
                    font-weight: 300;
                    letter-spacing: 24px;
                    color: #E0B045;
                    margin: 0;
                    margin-right: -24px;
                    white-space: nowrap;
                    padding-left: 10px;
                    line-height: 1;
                }
            `}</style>

            <div className="flex items-center justify-center">
                <div className="nxi-logo-box">
                    <div className="nxi-glow-layer"></div>
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
