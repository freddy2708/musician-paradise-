import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Minimize2 } from 'lucide-react';
import { SlideItem, ThemeConfig } from '../types/lyrics';
import { ThreeDBackground } from './ThreeDBackground';

interface PresentationCanvasProps {
  currentSlide: SlideItem | null;
  nextSlide: SlideItem | null;
  activeLineIndex: number;
  currentTime: number;
  theme: ThemeConfig;
  isBlackout: boolean;
  isClearText: boolean;
  isLowerThird: boolean;
  showConfidenceFooter?: boolean;
  isFullscreen?: boolean;
  aspectRatio?: '16:9' | '4:3' | 'fill';
  onNextSlide?: () => void;
  onPrevSlide?: () => void;
  onExitFullscreen?: () => void;
}

export const PresentationCanvas: React.FC<PresentationCanvasProps> = ({
  currentSlide,
  nextSlide,
  activeLineIndex,
  currentTime,
  theme,
  isBlackout,
  isClearText,
  isLowerThird,
  showConfidenceFooter = false,
  isFullscreen = false,
  aspectRatio = 'fill',
  onNextSlide,
  onPrevSlide,
  onExitFullscreen,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Background animated particle / ambient beam loop
  useEffect(() => {
    if (!theme.enableParticles) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 1280);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 720);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener('resize', handleResize);

    const count = theme.particleDensity === 'high' ? 65 : theme.particleDensity === 'medium' ? 40 : 20;
    
    // Generate soft glowing celestial dust motes
    const particles = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 2.8 + 0.8,
      vx: (Math.random() - 0.5) * 0.25,
      vy: -Math.random() * 0.45 - 0.1, // gently rising
      alpha: Math.random() * 0.5 + 0.15,
      pulseSpeed: Math.random() * 0.02 + 0.01,
      color: theme.backgroundType === 'particles-blue' 
        ? 'rgba(147, 197, 253, ' 
        : theme.backgroundType === 'emerald'
        ? 'rgba(110, 231, 183, '
        : 'rgba(253, 224, 71, ', // golden
    }));

    let frame = 0;
    const render = () => {
      frame++;
      ctx.clearRect(0, 0, width, height);

      // Subtle light ray cone
      const grad = ctx.createRadialGradient(
        width * 0.5,
        height * 0.15,
        10,
        width * 0.5,
        height * 0.5,
        width * 0.7
      );
      grad.addColorStop(0, 'rgba(255, 255, 255, 0.04)');
      grad.addColorStop(0.5, 'rgba(255, 255, 255, 0.01)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Render motes
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        // Wrap around
        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        const currentAlpha = p.alpha * (0.6 + 0.4 * Math.sin(frame * p.pulseSpeed));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${currentAlpha})`;
        ctx.fill();
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
    };
  }, [theme.enableParticles, theme.backgroundType, theme.particleDensity]);

  // Typography styles mapping
  const getFontFamily = () => {
    switch (theme.fontFamily) {
      case 'Cinzel':
        return "'Cinzel', serif";
      case 'Cormorant Garamond':
        return "'Cormorant Garamond', Georgia, serif";
      case 'Syne':
        return "'Syne', sans-serif";
      case 'Plus Jakarta Sans':
      default:
        return "'Plus Jakarta Sans', system-ui, sans-serif";
    }
  };

  const getFontSizeClass = () => {
    if (isLowerThird) {
      return 'text-xl sm:text-2xl md:text-3xl leading-snug';
    }
    switch (theme.fontSize) {
      case 'small':
        return 'text-2xl sm:text-3xl md:text-4xl leading-relaxed';
      case 'medium':
        return 'text-3xl sm:text-4xl md:text-5xl leading-tight';
      case 'huge':
        return 'text-4xl sm:text-6xl md:text-7xl leading-tight tracking-tight';
      case 'large':
      default:
        return 'text-3xl sm:text-5xl md:text-6xl leading-tight tracking-normal';
    }
  };

  const getTextShadow = () => {
    switch (theme.textShadow) {
      case 'theatrical':
        return '0 3px 18px rgba(0, 0, 0, 0.85), 0 1px 4px rgba(0, 0, 0, 0.9)';
      case 'strong':
        return '0 2px 10px rgba(0, 0, 0, 0.95)';
      case 'soft':
        return '0 2px 8px rgba(0, 0, 0, 0.5)';
      case 'none':
      default:
        return 'none';
    }
  };

  return (
    <div
      className={`relative overflow-hidden select-none transition-all duration-500 flex flex-col ${
        isFullscreen
          ? 'fixed inset-0 z-50 bg-black w-screen h-screen'
          : aspectRatio === '16:9'
          ? 'aspect-video w-full rounded-xl'
          : 'w-full h-full rounded-xl'
      }`}
      style={{
        background: theme.bgGradient,
      }}
    >
      {/* Floating Exit Fullscreen Button when in Fullscreen View */}
      {isFullscreen && onExitFullscreen && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onExitFullscreen();
          }}
          title="Exit Fullscreen (Esc or F)"
          className="absolute top-4 right-4 z-40 px-3 py-1.5 rounded-lg bg-black/60 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-white/10 backdrop-blur-md transition-all cursor-pointer opacity-40 hover:opacity-100 flex items-center gap-1.5 text-xs shadow-lg"
        >
          <Minimize2 className="w-3.5 h-3.5" />
          <span>Exit Fullscreen</span>
          <kbd className="text-[10px] bg-white/10 px-1 py-0.5 rounded font-mono">Esc</kbd>
        </button>
      )}

      {/* 3D Hardware Accelerated WebGL Environment */}
      {theme.threeDEnv && theme.threeDEnv.enabled && theme.threeDEnv.sceneType !== 'none' && (
        <ThreeDBackground config={theme.threeDEnv} />
      )}

      {/* Dynamic Ambient Particle Canvas */}
      {theme.enableParticles && !theme.threeDEnv?.enabled && (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 pointer-events-none z-0 opacity-80"
        />
      )}

      {/* Contrast Readability Scrim (Ensures 3D graphics never compromise lyrics legibility) */}
      <div
        className="absolute inset-0 pointer-events-none z-1"
        style={{
          backgroundColor: '#000000',
          opacity: theme.threeDEnv?.enabled ? theme.threeDEnv.contrastScrimOpacity : 0.25,
        }}
      />

      {/* Atmospheric Stage Vignette */}
      <div className="absolute inset-0 bg-radial-[circle_at_center,transparent_30%,rgba(0,0,0,0.6)_100%] pointer-events-none z-1" />

      {/* Interactive click zones for forward/backward on slides (helpful during worship) */}
      <div className="absolute inset-0 z-20 flex pointer-events-auto">
        <button
          type="button"
          aria-label="Previous slide"
          onClick={onPrevSlide}
          className="w-1/4 h-full cursor-w-resize opacity-0 hover:opacity-10 transition-opacity bg-white"
        />
        <div className="w-1/2 h-full" />
        <button
          type="button"
          aria-label="Next slide"
          onClick={onNextSlide}
          className="w-1/4 h-full cursor-e-resize opacity-0 hover:opacity-10 transition-opacity bg-white"
        />
      </div>

      {/* Blackout Layer (Key 'B') */}
      <div
        className={`absolute inset-0 bg-black z-30 transition-opacity duration-300 pointer-events-none ${
          isBlackout ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Slide Content Viewport */}
      <div
        className={`relative z-10 w-full h-full flex flex-col transition-all duration-300 ${
          isLowerThird
            ? 'justify-end pb-8 sm:pb-12 px-6 sm:px-12 md:px-20'
            : theme.layoutPosition === 'bottom-third'
            ? 'justify-end pb-16 px-6 sm:px-12 md:px-20'
            : theme.layoutPosition === 'top'
            ? 'justify-start pt-16 px-6 sm:px-12 md:px-20'
            : 'justify-center items-center px-6 sm:px-12 md:px-20'
        } ${isClearText ? 'opacity-0' : 'opacity-100'}`}
      >
        <AnimatePresence mode="wait">
          {currentSlide && (
            <motion.div
              key={currentSlide.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className={`w-full max-w-5xl mx-auto flex flex-col ${
                theme.textAlign === 'center'
                  ? 'text-center items-center'
                  : theme.textAlign === 'right'
                  ? 'text-right items-end'
                  : 'text-left items-start'
              }`}
            >
              {/* Optional Section Indicator (Quiet non-pill caption) */}
              {!isLowerThird && currentSlide.sectionLabel && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.75 }}
                  className="mb-3 sm:mb-4 text-xs tracking-widest text-amber-200/70 uppercase font-sans font-medium"
                >
                  {currentSlide.sectionLabel}
                </motion.div>
              )}

              {/* Lower Third Floating Banner Container (for Live Video Streaming) */}
              <div
                className={
                  isLowerThird
                    ? 'w-full bg-neutral-950/80 backdrop-blur-md border-l-4 border-amber-400 p-5 rounded-r-lg shadow-2xl'
                    : 'w-full'
                }
              >
                {/* Lyrics Lines Rendering */}
                <div
                  className={`space-y-3 sm:space-y-4 md:space-y-5 ${getFontSizeClass()}`}
                  style={{
                    fontFamily: getFontFamily(),
                    textShadow: getTextShadow(),
                    textTransform: theme.textTransform,
                  }}
                >
                  {currentSlide.lines.map((line, idx) => {
                    const isLineActive = idx === activeLineIndex;
                    const isUpcoming = idx > activeLineIndex;

                    return (
                      <motion.p
                        key={line.id}
                        initial={false}
                        animate={{
                          color:
                            theme.activeLineGlow && isLineActive
                              ? theme.highlightColor
                              : theme.textColor,
                          opacity:
                            theme.activeLineGlow
                              ? isLineActive
                                ? 1
                                : isUpcoming
                                ? 0.65
                                : 0.8
                              : 1,
                          scale: theme.activeLineGlow && isLineActive ? 1.015 : 1,
                        }}
                        transition={{ duration: 0.2 }}
                        className={`transition-all duration-300 font-${theme.fontWeight} ${
                          theme.activeLineGlow && isLineActive
                            ? 'drop-shadow-[0_0_12px_rgba(252,211,77,0.4)]'
                            : ''
                        }`}
                      >
                        {line.text}
                      </motion.p>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Confidence Monitor Footer (Upcoming slide hint for stage worship singers) */}
      {showConfidenceFooter && nextSlide && !isBlackout && (
        <div className="absolute bottom-2 left-4 right-4 z-20 flex items-center justify-between text-xs text-neutral-400 bg-neutral-950/70 backdrop-blur-md px-3 py-1.5 rounded-md border border-neutral-800">
          <div className="flex items-center gap-2 truncate">
            <span className="text-amber-400/90 font-medium">NEXT:</span>
            <span className="truncate text-neutral-300">
              {nextSlide.lines[0]?.text || nextSlide.sectionLabel}
            </span>
          </div>
          <div className="text-neutral-500 font-mono text-[11px] shrink-0 pl-3">
            starts at {Math.floor(nextSlide.startTime / 60)}:
            {Math.floor(nextSlide.startTime % 60)
              .toString()
              .padStart(2, '0')}
          </div>
        </div>
      )}
    </div>
  );
};
