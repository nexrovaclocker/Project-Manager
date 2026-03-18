'use client'

import { useEffect } from 'react'

export default function NexrovaIntro() {
    useEffect(() => {
        const revealEl = document.getElementById('nxk-splash-root')
        if (revealEl) {
            setTimeout(() => {
                revealEl.style.opacity = '0'
                setTimeout(() => {
                    // revealEl.remove() // REMOVED: Let React securely unmount this to prevent hydration/removeChild crashes
                    window.dispatchEvent(new Event('revealComplete'))
                }, 700)
            }, 5200)
        }
    }, [])

    return (
        <div id="nxk-splash-root" className="nxk-splash">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@700&display=swap');

                .nxk-splash {
                    position: fixed;
                    inset: 0;
                    background: #07080d;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    overflow: hidden;
                    z-index: 9999;
                    transition: opacity 0.7s ease;
                }
                .nxk-scanline {
                    position: absolute;
                    inset: 0;
                    background: repeating-linear-gradient(
                        0deg,
                        transparent, transparent 3px,
                        rgba(0,0,0,.05) 3px, rgba(0,0,0,.05) 4px
                    );
                    pointer-events: none;
                    z-index: 10;
                }

                .nxk-pair {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 432px;
                    height: 110px;
                    z-index: 5;
                }

                .nxk-radial-glow {
                    position: absolute;
                    width: 800px;
                    height: 800px;
                    background: radial-gradient(circle, rgba(201,168,76,0.15) 0%, rgba(7,8,13,0) 60%);
                    opacity: 0;
                    animation: nxkGlowBloom 2s ease forwards;
                    animation-delay: 0.3s;
                    pointer-events: none;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    z-index: 1;
                }
                @keyframes nxkGlowBloom { to { opacity: 1; } }

                .nxk-logo {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 110px;
                    height: 110px;
                    object-fit: contain;
                    filter: drop-shadow(0 0 22px #c9a84c60) drop-shadow(0 0 6px #c9a84c30);
                    transform: translateX(161px) scale(0.3);
                    opacity: 0;
                    animation: 
                        nxkLogoFadeZoom 1.8s cubic-bezier(.1,.8,.2,1) forwards,
                        nxkLogoSplit 0.55s cubic-bezier(.7,0,.2,1) forwards;
                    animation-delay: 0.4s, 3.25s;
                    z-index: 10;
                }

                @keyframes nxkLogoFadeZoom {
                    to {
                        opacity: 1;
                        transform: translateX(161px) scale(1);
                    }
                }
                @keyframes nxkLogoSplit {
                    from { transform: translateX(161px) scale(1); }
                    to { transform: translateX(0) scale(1); }
                }

                .nxk-ticks {
                    position: absolute;
                    top: 0; left: 0;
                    width: 110px; height: 110px;
                    transform: translateX(161px);
                    opacity: 0;
                    animation: 
                        nxkTicksAppear 0.5s ease forwards,
                        nxkTicksSplit 0.55s cubic-bezier(.7,0,.2,1) forwards;
                    animation-delay: 2.3s, 3.25s;
                    pointer-events: none;
                    z-index: 15;
                }
                @keyframes nxkTicksAppear { to { opacity: 1; } }
                @keyframes nxkTicksSplit {
                    from { transform: translateX(161px); }
                    to { transform: translateX(0); }
                }

                .nxk-tick {
                    position: absolute;
                    width: 10px;
                    height: 10px;
                    border-color: #c9a84c;
                    border-style: solid;
                    border-width: 0;
                }
                .nxk-tick-tl { top: -8px; left: -8px; border-top-width: 1.5px; border-left-width: 1.5px; }
                .nxk-tick-tr { top: -8px; right: -8px; border-top-width: 1.5px; border-right-width: 1.5px; }
                .nxk-tick-bl { bottom: -8px; left: -8px; border-bottom-width: 1.5px; border-left-width: 1.5px; }
                .nxk-tick-br { bottom: -8px; right: -8px; border-bottom-width: 1.5px; border-right-width: 1.5px; }

                .nxk-sweep {
                    position: absolute;
                    top: 50%;
                    left: 0;
                    width: 100vw;
                    height: 1px;
                    background: linear-gradient(90deg, transparent 0%, #c9a84c 50%, transparent 100%);
                    opacity: 0;
                    transform: scaleX(0);
                    animation: nxkSweep 0.5s ease forwards;
                    animation-delay: 3.2s;
                    z-index: 20;
                }
                @keyframes nxkSweep {
                    0% { transform: scaleX(0); opacity: 0; }
                    50% { transform: scaleX(1); opacity: 1; }
                    100% { transform: scaleX(0); opacity: 0; }
                }

                .nxk-wordmark {
                    position: absolute;
                    top: 50%;
                    left: 132px;
                    margin-top: -31px; /* 62px height */
                    font-family: 'Rajdhani', sans-serif;
                    font-weight: 700;
                    font-size: 62px;
                    letter-spacing: 12px;
                    color: #c9a84c;
                    text-shadow: 0 0 40px #c9a84c90, 0 0 80px #c9a84c30;
                    text-transform: uppercase;
                    line-height: 1;
                    white-space: nowrap;
                    clip-path: inset(0 100% 0 0);
                    transform: translateX(29px);
                    animation: nxkWordmarkSplit 0.55s cubic-bezier(.7,0,.2,1) forwards;
                    animation-delay: 3.25s;
                    z-index: 5;
                }
                @keyframes nxkWordmarkSplit {
                    from { clip-path: inset(0 100% 0 0); transform: translateX(29px); }
                    to { clip-path: inset(0 0% 0 0); transform: translateX(0); }
                }
            `}</style>
            
            <div className="nxk-scanline"></div>
            <div className="nxk-radial-glow"></div>
            <div className="nxk-sweep"></div>

            <div className="nxk-pair">
                <div className="nxk-ticks">
                    <div className="nxk-tick nxk-tick-tl"></div>
                    <div className="nxk-tick nxk-tick-tr"></div>
                    <div className="nxk-tick nxk-tick-bl"></div>
                    <div className="nxk-tick nxk-tick-br"></div>
                </div>
                
                <img 
                    src="/assets/logo.png" 
                    onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.onerror = null;
                        target.src='/logo.jpeg'; /* Fallback */
                        target.style.mixBlendMode='screen';
                    }} 
                    className="nxk-logo" 
                    alt="NEXROVA" 
                />
                
                <div className="nxk-wordmark">NEXROVA</div>
            </div>
        </div>
    )
}
