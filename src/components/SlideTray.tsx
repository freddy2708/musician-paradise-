import React, { useState } from 'react';
import { SlideItem } from '../types/lyrics';
import { Play, Clock, Search, Plus, Trash2, ArrowUp, ArrowDown } from 'lucide-react';

interface SlideTrayProps {
  slides: SlideItem[];
  currentSlideIndex: number;
  currentTime: number;
  onSelectSlide: (index: number) => void;
  onNudgeSlideTiming: (index: number, deltaSeconds: number) => void;
  onSetSlideStartTimeToNow: (index: number) => void;
  onMoveSlide: (index: number, direction: 'up' | 'down') => void;
  onDeleteSlide: (index: number) => void;
  onAddSlideAfter: (index: number) => void;
}

export const SlideTray: React.FC<SlideTrayProps> = ({
  slides,
  currentSlideIndex,
  currentTime,
  onSelectSlide,
  onNudgeSlideTiming,
  onSetSlideStartTimeToNow,
  onMoveSlide,
  onDeleteSlide,
  onAddSlideAfter,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const formatMinSec = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const getSectionBadgeClass = (section: string) => {
    switch (section) {
      case 'chorus':
        return 'text-rose-400 border-rose-800/60 bg-rose-950/40';
      case 'verse':
        return 'text-indigo-400 border-indigo-800/60 bg-indigo-950/40';
      case 'bridge':
      case 'vamp':
        return 'text-purple-400 border-purple-800/60 bg-purple-950/40';
      case 'outro':
        return 'text-emerald-400 border-emerald-800/60 bg-emerald-950/40';
      case 'intro':
      case 'instrumental':
      default:
        return 'text-neutral-400 border-neutral-800 bg-neutral-900';
    }
  };

  const filteredSlides = slides.map((slide, originalIndex) => ({
    slide,
    originalIndex,
  })).filter(({ slide }) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    const lyricsText = slide.lines.map((l) => l.text).join(' ').toLowerCase();
    const sectionText = slide.sectionLabel.toLowerCase();
    return lyricsText.includes(query) || sectionText.includes(query);
  });

  return (
    <div className="flex flex-col gap-3 bg-neutral-900/90 border border-neutral-800 rounded-xl p-3 sm:p-4">
      {/* Header and search bar */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-neutral-200">
            Slide Deck ({slides.length} slides)
          </span>
          <span className="text-xs text-neutral-500">
            Press 1-9 to jump or click any slide
          </span>
        </div>

        <div className="relative w-48 sm:w-64">
          <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search lyrics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-neutral-200 placeholder:text-neutral-600 focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* Grid of Slide Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 max-h-[380px] overflow-y-auto pr-1">
        {filteredSlides.map(({ slide, originalIndex }) => {
          const isCurrent = originalIndex === currentSlideIndex;

          return (
            <div
              key={slide.id}
              onClick={() => onSelectSlide(originalIndex)}
              className={`relative group rounded-lg p-3 text-left transition-all border cursor-pointer flex flex-col justify-between select-none ${
                isCurrent
                  ? 'bg-neutral-800/90 border-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.25)] ring-1 ring-amber-400'
                  : 'bg-neutral-950/70 hover:bg-neutral-800/60 border-neutral-800/80 text-neutral-300'
              }`}
            >
              {/* Top metadata row */}
              <div className="flex items-center justify-between gap-1 mb-2">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-mono font-bold ${
                      isCurrent
                        ? 'bg-amber-400 text-neutral-950'
                        : 'bg-neutral-800 text-neutral-400 group-hover:text-neutral-200'
                    }`}
                  >
                    {originalIndex + 1}
                  </span>
                  <span
                    className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${getSectionBadgeClass(
                      slide.section
                    )}`}
                  >
                    {slide.sectionLabel}
                  </span>
                </div>

                <div className="flex items-center gap-1 text-[11px] font-mono text-neutral-400 tabular-nums">
                  <Clock className="w-3 h-3 text-neutral-500" />
                  <span>
                    {formatMinSec(slide.startTime)} - {formatMinSec(slide.endTime)}
                  </span>
                </div>
              </div>

              {/* Lyrics snippet */}
              <div className="space-y-1 mb-3">
                {slide.lines.map((line, idx) => (
                  <p
                    key={line.id || idx}
                    className={`text-xs line-clamp-1 transition-colors ${
                      isCurrent
                        ? 'text-neutral-100 font-medium'
                        : 'text-neutral-300 group-hover:text-white'
                    }`}
                  >
                    {line.text}
                  </p>
                ))}
              </div>

              {/* Bottom Quick Tools */}
              <div
                className="flex items-center justify-between pt-2 border-t border-neutral-800/70 text-[10px] text-neutral-500"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Nudge timing */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    title="Nudge -0.5s"
                    onClick={() => onNudgeSlideTiming(originalIndex, -0.5)}
                    className="px-1.5 py-0.5 rounded bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-400 hover:text-neutral-200 cursor-pointer"
                  >
                    -0.5s
                  </button>
                  <button
                    type="button"
                    title="Nudge +0.5s"
                    onClick={() => onNudgeSlideTiming(originalIndex, 0.5)}
                    className="px-1.5 py-0.5 rounded bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-400 hover:text-neutral-200 cursor-pointer"
                  >
                    +0.5s
                  </button>
                  <button
                    type="button"
                    title="Stamp current time as this slide start"
                    onClick={() => onSetSlideStartTimeToNow(originalIndex)}
                    className="px-1.5 py-0.5 rounded bg-neutral-900 hover:bg-amber-950/60 border border-neutral-800 hover:border-amber-600/50 text-neutral-400 hover:text-amber-300 cursor-pointer"
                  >
                    Set=Now
                  </button>
                </div>

                {/* Move & Add Actions */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={originalIndex === 0}
                    onClick={() => onMoveSlide(originalIndex, 'up')}
                    title="Move slide earlier"
                    className="p-1 rounded hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 disabled:opacity-30 cursor-pointer"
                  >
                    <ArrowUp className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    disabled={originalIndex === slides.length - 1}
                    onClick={() => onMoveSlide(originalIndex, 'down')}
                    title="Move slide later"
                    className="p-1 rounded hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 disabled:opacity-30 cursor-pointer"
                  >
                    <ArrowDown className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onAddSlideAfter(originalIndex)}
                    title="Add slide after this"
                    className="p-1 rounded hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                  {slides.length > 1 && (
                    <button
                      type="button"
                      onClick={() => onDeleteSlide(originalIndex)}
                      title="Delete slide"
                      className="p-1 rounded hover:bg-red-950/60 text-neutral-500 hover:text-red-400 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
