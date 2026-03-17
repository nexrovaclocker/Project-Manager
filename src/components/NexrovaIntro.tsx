'use client'

import { useRef } from 'react'
import Image from 'next/image'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(useGSAP)

export default function NexrovaIntro({ onComplete }: { onComplete: () => void }) {
    const container = useRef<HTMLDivElement>(null)

    useGSAP(() => {
        const tl = gsap.timeline({
            onComplete: () => {
                // Fade out the entire container smoothly after the animation finishes
                gsap.to(container.current, {
                    opacity: 0,
                    duration: 1.0,
                    ease: 'power2.inOut',
                    onComplete: () => {
                        onComplete()
                    }
                })
            }
        })

        // Stage 1 (0s-2.5s): Fade in + Cinematic Zoom
        tl.fromTo('.logo-box',
            { opacity: 0, scale: 0.8 },
            {
                opacity: 1,
                scale: 1.1,
                duration: 2.5,
                ease: 'power2.inOut'
            },
            0
        )

        // Ignite the vibrant white->yellow->orange glow
        tl.to('.glow-layer', {
            opacity: 0.8,
            duration: 1.0,
            ease: 'power1.inOut',
        }, 1.5)

        // Start infinite pulsing of the glow
        tl.add(() => {
            gsap.to('.glow-layer', {
                opacity: 1,
                filter: 'blur(18px)',
                scale: 1.02,
                duration: 1.25,
                yoyo: true,
                repeat: -1,
                ease: 'sine.inOut'
            })
        }, 2.5)

        // Stage 2 (2.5s-4s): Smooth slide + Text Clip-Path Reveal
        tl.to('.logo-box', {
            scale: 1.0,
            duration: 1.5,
            ease: 'power3.inOut'
        }, 2.5)

        // Expanding the text-box width visually creates the rightward 'emergence' wipe
        tl.fromTo('.text-box',
            {
                marginLeft: 0,
                clipPath: 'inset(0 100% 0 0)',
                webkitClipPath: 'inset(0 100% 0 0)'
            },
            {
                marginLeft: 40, // Premium visual gap
                clipPath: 'inset(0 0% 0 0)',
                webkitClipPath: 'inset(0 0% 0 0)',
                duration: 1.5,
                ease: 'power3.inOut'
            },
            2.5
        )

        // Hold the final centered state for a cinematic pause before fading out entirely
        tl.to({}, { duration: 1.8 })

    }, { scope: container })

    return (
        <div 
            ref={container} 
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#080808]" 
            style={{ background: 'radial-gradient(circle at center, #111111 0%, #050505 100%)' }}
        >
            <style>{`
                .logo-box {
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
                .glow-layer {
                    position: absolute;
                    top: -6px; right: -6px; bottom: -6px; left: -6px;
                    background: linear-gradient(45deg, #ffffff, #ffea00, #ff8c00);
                    z-index: -1;
                    border-radius: inherit;
                    filter: blur(14px);
                    opacity: 0;
                }
                .logo-img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    border-radius: inherit;
                    z-index: 2;
                    position: relative;
                    background-color: #080808;
                }
                .text-box {
                    display: flex;
                    align-items: center;
                    margin-left: 0;
                    clip-path: inset(0 100% 0 0);
                    -webkit-clip-path: inset(0 100% 0 0);
                }
                .text-content {
                    font-size: 84px;
                    font-weight: 200;
                    letter-spacing: 24px;
                    color: #ffffff;
                    margin: 0;
                    margin-right: -24px;
                    white-space: nowrap;
                    padding-left: 10px;
                    line-height: 1;
                }
            `}</style>
            
            <div className="flex items-center justify-center">
                <div className="logo-box">
                    <div className="glow-layer"></div>
                    <Image 
                        src="/logo.jpeg" 
                        alt="NEXROVA Logo" 
                        width={130} 
                        height={130} 
                        className="logo-img" 
                        priority 
                    />
                </div>
                
                <div className="text-box">
                    <h1 className="text-content">NEXROVA</h1>
                </div>
            </div>
        </div>
    )
}
