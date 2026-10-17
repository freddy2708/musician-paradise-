import React, { useRef } from 'react';
import { SlideItem } from '../types/lyrics';

interface TimelineBarProps {
  slides: SlideItem[];
  currentSlideIndex: number;
  currentTime: number;
  totalDuration: number;
  onSeek: (time: number) => void;
  onSelectSlide: (index: number) => void;
}

export const TimelineBar: React.FC<TimelineBarProps> = ({
  slides,
  currentSlideIndex,
  currentTime,
  totalDuration,
  onSeek,
  onSelectSlide,
}) => {
  const barRef = useRef<HTMLDivElement | null>(null);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 10);
    return `${mins}:${secs.toString().padStart(2, '0')}.${ms}`;
  };

  const handlePointerDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!barRef.current) return;
    const rect = barRef.current.getBoundingClientRect();
    const clickX = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const targetTime = (clickX / rect.width) * totalDuration;
    onSeek(targetTime);
  };

  const getSectionColor = (section: string, isCurrent: boolean) => {
    if (isCurrent) return 'bg-amber-500/80 border-amber-300 text-amber-950 font-bold';
    switch (section) {
      case 'chorus':
        return 'bg-rose-950/60 hover:bg-rose-900/70 border-rose-700/60 text-rose-200';
      case 'verse':
        return 'bg-indigo-950/60 hover:bg-indigo-900/70 border-indigo-700/60 text-indigo-200';
      case 'bridge':
      case 'vamp':
        return 'bg-purple-950/60 hover:bg-purple-900/70 border-purple-700/60 text-purple-200';
      case 'outro':
        return 'bg-emerald-950/60 hover:bg-emerald-900/70 border-emerald-700/60 text-emerald-200';
      case 'intro':
      case 'instrumental':
      default:
        return 'bg-neutral-800/80 hover:bg-neutral-700/80 border-neutral-700 text-neutral-300';
    }
  };

  const progressPercent = Math.min(100, Math.max(0, (currentTime / (totalDuration || 1)) * 100));

  return (
    <div className="w-full flex flex-col gap-2 bg-neutral-900/80 border border-neutral-800 rounded-lg p-3">
      {/* Upper info row: current time, duration, active section */}
      <div className="flex items-center justify-between text-xs font-mono text-neutral-400">
        <div className="flex items-center gap-3">
          <span className="text-amber-400 font-semibold text-sm tabular-nums">
            {formatTime(currentTime)}
          </span>
          <span className="text-neutral-600">/</span>
          <span className="text-neutral-400 tabular-nums">
            {formatTime(totalDuration)}
          </span>
          {slides[currentSlideIndex] && (
            <span className="text-neutral-300 font-sans ml-2 text-xs truncate max-w-xs">
              Slide {currentSlideIndex + 1}: {slides[currentSlideIndex].sectionLabel}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 text-[11px] text-neutral-500 font-sans">
          <span>Click timeline to scrub or select slide</span>
        </div>
      </div>

      {/* Interactive Timeline Track */}
      <div
        ref={barRef}
        onClick={handlePointerDown}
        className="relative h-11 w-full bg-neutral-950 rounded-md border border-neutral-800 overflow-hidden cursor-pointer select-none group"
      >
        {/* Slides blocks along the timeline */}
        <div className="absolute inset-0 flex">
          {slides.map((slide, idx) => {
            const startPct = (slide.startTime / totalDuration) * 100;
            const endPct = (slide.endTime / totalDuration) * 100;
            const widthPct = Math.max(0.5, endPct - startPct);
            const isCurrent = idx === currentSlideIndex;

            return (
              <div
                key={slide.id}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectSlide(idx);
                  onSeek(slide.startTime);
                }}
                style={{
                  left: `${startPct}%`,
                  width: `${widthPct}%`,
                }}
                className={`absolute top-0 bottom-0 border-r flex flex-col justify-center px-1.5 overflow-hidden transition-colors ${getSectionColor(
                  slide.section,
                  isCurrent
                )}`}
                title={`${slide.sectionLabel} (${formatTime(slide.startTime)} - ${formatTime(
                  slide.endTime
                )}): ${slide.lines[0]?.text || ''}`}
              >
                <span className="text-[10px] font-sans truncate leading-none">
                  {slide.sectionLabel}
                </span>
                <span className="text-[9px] font-mono opacity-70 truncate leading-tight">
                  {formatTime(slide.startTime)}
                </span>
              </div>
            );
          })}
        </div>

        {/* Current Playhead cursor line */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-amber-400 z-10 pointer-events-none shadow-[0_0_8px_rgba(251,191,36,0.9)]"
          style={{ left: `${progressPercent}%` }}
        >
          <div className="absolute -top-1 -left-1.5 w-3.5 h-2 bg-amber-400 rounded-b-xs shadow" />
        </div>
      </div>
    </div>
  );
};
