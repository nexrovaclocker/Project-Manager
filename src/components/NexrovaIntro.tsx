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

        // Phase 1: Logo Reveal
        tl.fromTo('.nxi-logo-box',
            { opacity: 0, scale: 0.8 },
            {
                opacity: 1,
                scale: 1,
                duration: 1.5,
                ease: 'power2.inOut'
            }
        )

        // Phase 2: Typewriter Effect
        // We'll use a simple character-by-character reveal since we don't assume TextPlugin is available in the bundle
        const textElement = document.querySelector('.nxi-text-content');
        if (textElement) {
            const fullText = "NEXROVA";
            textElement.textContent = "";
            
            tl.to({}, {
                duration: 1.5,
                onUpdate: function() {
                    const progress = this.progress();
                    const currentCount = Math.floor(progress * fullText.length);
                    textElement.textContent = fullText.slice(0, currentCount);
                },
                ease: "none"
            }, "+=0.5");
        }

        // Phase 3: Hold for a beat
        tl.to({}, { 
            duration: 1.5,
            onStart: () => {
                // Start the infinite blink separately so it doesn't block the timeline from finishing
                gsap.to('.nxi-text-content', {
                    borderRightColor: 'transparent',
                    repeat: -1,
                    duration: 0.5,
                    yoyo: true,
                    ease: 'sine.inOut'
                })
            }
        })

    }, { scope: container, dependencies: [isLoaded] })

    return (
        <div
            ref={container}
            className="fixed inset-0 z-50 flex items-center justify-center font-mono"
            style={{ background: '#000000' }}
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
                    border: 1px solid #E0B045;
                    box-shadow: 0 0 10px #E0B045;
                }
                .nxi-logo-img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    z-index: 2;
                    position: relative;
                }
                .nxi-text-box {
                    display: flex;
                    align-items: center;
                    margin-left: 40px;
                }
                .nxi-text-content {
                    font-size: 84px;
                    font-weight: 300;
                    letter-spacing: 12px;
                    color: #E0B045;
                    margin: 0;
                    white-space: nowrap;
                    padding-left: 10px;
                    line-height: 1;
                    border-right: 2px solid #E0B045;
                    padding-right: 5px;
                    min-width: 1ch;
                }
            `}</style>

            <div className="flex items-center justify-center">
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
                    <h1 className="nxi-text-content"></h1>
                </div>
            </div>
        </div>
    )
}
