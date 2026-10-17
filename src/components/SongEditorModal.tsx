import React, { useState, useEffect } from 'react';
import { SlideItem, SongMetadata, SectionType } from '../types/lyrics';
import { defaultSlides, defaultSongMeta, song1Meta, song1Slides, song2Meta, song2Slides } from '../data/defaultSong';
import { X, FileText, Download, Upload, Plus, Trash2, RotateCcw, Copy, Check, Sparkles } from 'lucide-react';

interface SongEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  songMeta: SongMetadata;
  slides: SlideItem[];
  onSave: (meta: SongMetadata, slides: SlideItem[]) => void;
}

export const SongEditorModal: React.FC<SongEditorModalProps> = ({
  isOpen,
  onClose,
  songMeta,
  slides,
  onSave,
}) => {
  const [activeTab, setActiveTab] = useState<'slides' | 'paste' | 'export'>('slides');
  const [editedMeta, setEditedMeta] = useState<SongMetadata>({ ...songMeta });
  const [editedSlides, setEditedSlides] = useState<SlideItem[]>(JSON.parse(JSON.stringify(slides)));
  const [rawText, setRawText] = useState('');
  const [linesPerSlide, setLinesPerSlide] = useState(3);
  const [secondsPerSlide, setSecondsPerSlide] = useState(14);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setEditedMeta({ ...songMeta });
      setEditedSlides(JSON.parse(JSON.stringify(slides)));
    }
  }, [isOpen, songMeta, slides]);

  if (!isOpen) return null;

  const handleUpdateSlideField = (index: number, field: keyof SlideItem, val: unknown) => {
    const updated = [...editedSlides];
    updated[index] = { ...updated[index], [field]: val };
    setEditedSlides(updated);
  };

  const handleUpdateSlideLinesText = (index: number, newLinesText: string) => {
    const updated = [...editedSlides];
    const linesArray = newLinesText.split('\n').filter((l) => l.trim().length > 0);
    const slideDuration = updated[index].endTime - updated[index].startTime;
    const perLineDuration = linesArray.length > 0 ? slideDuration / linesArray.length : 1;

    updated[index].lines = linesArray.map((txt, lineIdx) => ({
      id: `l-${Date.now()}-${lineIdx}`,
      text: txt.trim(),
      startTime: updated[index].startTime + lineIdx * perLineDuration,
      endTime: updated[index].startTime + (lineIdx + 1) * perLineDuration,
    }));

    setEditedSlides(updated);
  };

  const handleAddSlide = () => {
    const lastSlide = editedSlides[editedSlides.length - 1];
    const newStart = lastSlide ? lastSlide.endTime : 0;
    const newEnd = newStart + 15;
    const newSlide: SlideItem = {
      id: `slide-${Date.now()}`,
      section: 'verse',
      sectionLabel: `Slide ${editedSlides.length + 1}`,
      startTime: newStart,
      endTime: newEnd,
      lines: [{ id: `l-${Date.now()}-1`, text: 'New Lyric Line', startTime: newStart, endTime: newEnd }],
    };
    setEditedSlides([...editedSlides, newSlide]);
  };

  const handleDeleteSlide = (index: number) => {
    if (editedSlides.length <= 1) return;
    setEditedSlides(editedSlides.filter((_, i) => i !== index));
  };

  const handleGenerateFromRaw = () => {
    if (!rawText.trim()) return;

    // Split text into non-empty lines
    const rawLines = rawText
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    const newSlides: SlideItem[] = [];
    let currentTime = 0;

    for (let i = 0; i < rawLines.length; i += linesPerSlide) {
      const slice = rawLines.slice(i, i + linesPerSlide);
      const slideStart = currentTime;
      const slideEnd = slideStart + secondsPerSlide;
      const lineDuration = secondsPerSlide / slice.length;

      const lines = slice.map((text, idx) => ({
        id: `l-${Date.now()}-${i + idx}`,
        text,
        startTime: slideStart + idx * lineDuration,
        endTime: slideStart + (idx + 1) * lineDuration,
      }));

      // Guess section name
      let section: SectionType = 'verse';
      let sectionLabel = `Slide ${Math.floor(i / linesPerSlide) + 1}`;
      const sample = slice.join(' ').toLowerCase();
      if (sample.includes('worship') || sample.includes('chorus') || sample.includes('forever')) {
        section = 'chorus';
        sectionLabel = 'Chorus';
      }

      newSlides.push({
        id: `slide-gen-${Date.now()}-${i}`,
        section,
        sectionLabel,
        startTime: slideStart,
        endTime: slideEnd,
        lines,
      });

      currentTime = slideEnd;
    }

    setEditedSlides(newSlides);
    setEditedMeta((prev) => ({ ...prev, totalDuration: Math.max(currentTime, 180) }));
    setActiveTab('slides');
  };

  const handleExportLRC = () => {
    let lrc = `[ti:${editedMeta.title}]\n[ar:${editedMeta.artist}]\n[al:SlidePraise Worship]\n\n`;
    editedSlides.forEach((slide) => {
      slide.lines.forEach((line) => {
        const mins = Math.floor(line.startTime / 60);
        const secs = Math.floor(line.startTime % 60);
        const ms = Math.floor((line.startTime % 1) * 100);
        const stamp = `[${mins.toString().padStart(2, '0')}:${secs
          .toString()
          .padStart(2, '0')}.${ms.toString().padStart(2, '0')}]`;
        lrc += `${stamp}${line.text}\n`;
      });
    });

    const blob = new Blob([lrc], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${editedMeta.title.replace(/\s+/g, '_')}_synced.lrc`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportJSON = () => {
    const data = JSON.stringify({ metadata: editedMeta, slides: editedSlides }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${editedMeta.title.replace(/\s+/g, '_')}_slides.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleResetToDefault = () => {
    setEditedMeta({ ...defaultSongMeta });
    setEditedSlides(JSON.parse(JSON.stringify(defaultSlides)));
  };

  const handleSaveAndApply = () => {
    onSave(editedMeta, editedSlides);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-400" />
            <h2 className="text-base font-semibold text-neutral-100">
              Lyrics Editor & Slide Synchronizer
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleResetToDefault}
              className="text-xs text-neutral-400 hover:text-amber-300 flex items-center gap-1 px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" /> Reset Default Song
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-neutral-800 bg-neutral-950/60 text-xs font-medium">
          <button
            type="button"
            onClick={() => setActiveTab('slides')}
            className={`pb-2.5 px-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'slides'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Slide-by-Slide Timings ({editedSlides.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('paste')}
            className={`pb-2.5 px-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'paste'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Bulk Lyrics Importer / Auto-Splitter
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('export')}
            className={`pb-2.5 px-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'export'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Export & Formats (.LRC / JSON)
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
          {activeTab === 'slides' && (
            <div className="space-y-4">
              {/* Quick Preset Selector */}
              <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-neutral-950/80 rounded-xl border border-neutral-800">
                <span className="text-[11px] text-neutral-400 flex items-center gap-1 font-medium">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Load Preset Song:
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditedMeta({ ...song1Meta });
                      setEditedSlides(JSON.parse(JSON.stringify(song1Slides)));
                    }}
                    className="px-2.5 py-1 rounded bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-700 hover:border-amber-500/50 text-[11px] transition-colors cursor-pointer"
                  >
                    You Laid Aside Your Majesty (G)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditedMeta({ ...song2Meta });
                      setEditedSlides(JSON.parse(JSON.stringify(song2Slides)));
                    }}
                    className="px-2.5 py-1 rounded bg-neutral-900 hover:bg-neutral-800 text-emerald-300 border border-neutral-700 hover:border-emerald-500/50 text-[11px] transition-colors cursor-pointer"
                  >
                    God, You’re So Good (Bb, 2018)
                  </button>
                </div>
              </div>

              {/* Song Title & Meta Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 p-3 bg-neutral-950 rounded-xl border border-neutral-800">
                <div className="sm:col-span-2">
                  <label className="text-[11px] text-neutral-400 block mb-1">Song Title</label>
                  <input
                    type="text"
                    value={editedMeta.title}
                    onChange={(e) => setEditedMeta({ ...editedMeta, title: e.target.value })}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-2.5 py-1.5 text-neutral-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-neutral-400 block mb-1">Artist / Writer</label>
                  <input
                    type="text"
                    value={editedMeta.artist}
                    onChange={(e) => setEditedMeta({ ...editedMeta, artist: e.target.value })}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-2.5 py-1.5 text-neutral-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-neutral-400 block mb-1">Key</label>
                  <input
                    type="text"
                    value={editedMeta.originalKey}
                    onChange={(e) => setEditedMeta({ ...editedMeta, originalKey: e.target.value })}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-2.5 py-1.5 text-neutral-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-neutral-400 block mb-1">Tempo (BPM)</label>
                  <input
                    type="number"
                    value={editedMeta.tempoBpm}
                    onChange={(e) =>
                      setEditedMeta({ ...editedMeta, tempoBpm: Number(e.target.value) || 68 })
                    }
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-2.5 py-1.5 text-neutral-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Slide List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-neutral-300">Individual Slides & Timestamps</span>
                  <button
                    type="button"
                    onClick={handleAddSlide}
                    className="px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Slide
                  </button>
                </div>

                {editedSlides.map((slide, idx) => (
                  <div
                    key={slide.id}
                    className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 flex flex-col gap-2.5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-800/80 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded bg-neutral-800 flex items-center justify-center font-mono font-bold text-neutral-300">
                          {idx + 1}
                        </span>
                        <input
                          type="text"
                          value={slide.sectionLabel}
                          onChange={(e) =>
                            handleUpdateSlideField(idx, 'sectionLabel', e.target.value)
                          }
                          placeholder="Section (e.g. Chorus)"
                          className="bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-xs text-neutral-200 w-36"
                        />
                        <select
                          value={slide.section}
                          onChange={(e) =>
                            handleUpdateSlideField(idx, 'section', e.target.value as SectionType)
                          }
                          className="bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-xs text-neutral-300"
                        >
                          <option value="intro">Intro</option>
                          <option value="verse">Verse</option>
                          <option value="chorus">Chorus</option>
                          <option value="bridge">Bridge</option>
                          <option value="vamp">Vamp</option>
                          <option value="outro">Outro</option>
                          <option value="instrumental">Instrumental</option>
                        </select>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 font-mono text-neutral-400">
                          <span>Start (s):</span>
                          <input
                            type="number"
                            step="0.5"
                            value={slide.startTime}
                            onChange={(e) =>
                              handleUpdateSlideField(idx, 'startTime', parseFloat(e.target.value) || 0)
                            }
                            className="w-16 bg-neutral-900 border border-neutral-700 rounded px-1.5 py-0.5 text-center text-neutral-200"
                          />
                        </div>
                        <div className="flex items-center gap-1 font-mono text-neutral-400">
                          <span>End (s):</span>
                          <input
                            type="number"
                            step="0.5"
                            value={slide.endTime}
                            onChange={(e) =>
                              handleUpdateSlideField(idx, 'endTime', parseFloat(e.target.value) || 0)
                            }
                            className="w-16 bg-neutral-900 border border-neutral-700 rounded px-1.5 py-0.5 text-center text-neutral-200"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteSlide(idx)}
                          className="p-1 rounded text-neutral-500 hover:text-red-400 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] text-neutral-500 block mb-1">
                        Slide Lines (one per row):
                      </label>
                      <textarea
                        rows={slide.lines.length || 2}
                        value={slide.lines.map((l) => l.text).join('\n')}
                        onChange={(e) => handleUpdateSlideLinesText(idx, e.target.value)}
                        className="w-full bg-neutral-900 border border-neutral-700 rounded-lg p-2 text-neutral-200 font-sans leading-relaxed focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'paste' && (
            <div className="space-y-4">
              <div className="p-4 bg-neutral-950 rounded-xl border border-neutral-800 space-y-3">
                <h3 className="font-semibold text-neutral-200 text-sm">
                  Paste Raw Song Lyrics & Auto-Split Into Timed Slides
                </h3>
                <p className="text-neutral-400 text-xs">
                  Paste any lyrics below. The engine will divide them into slide chunks with
                  rhythm-paced start and end timestamps ready for playback.
                </p>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] text-neutral-400 block mb-1">
                      Lines Per Slide:
                    </label>
                    <select
                      value={linesPerSlide}
                      onChange={(e) => setLinesPerSlide(Number(e.target.value))}
                      className="w-full bg-neutral-900 border border-neutral-700 rounded-lg p-2 text-neutral-200"
                    >
                      <option value={2}>2 lines per slide (Large font / TV)</option>
                      <option value={3}>3 lines per slide (Standard worship)</option>
                      <option value={4}>4 lines per slide (Compact)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] text-neutral-400 block mb-1">
                      Estimated Duration per Slide (seconds):
                    </label>
                    <input
                      type="number"
                      value={secondsPerSlide}
                      onChange={(e) => setSecondsPerSlide(Number(e.target.value) || 12)}
                      className="w-full bg-neutral-900 border border-neutral-700 rounded-lg p-2 text-neutral-200"
                    />
                  </div>
                </div>

                <textarea
                  rows={10}
                  placeholder="Paste lyrics here..."
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-lg p-3 text-neutral-200 font-sans focus:outline-none focus:border-amber-500"
                />

                <button
                  type="button"
                  onClick={handleGenerateFromRaw}
                  className="px-5 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs cursor-pointer shadow-lg"
                >
                  Generate Slides & Sync Timestamps
                </button>
              </div>
            </div>
          )}

          {activeTab === 'export' && (
            <div className="space-y-4">
              <div className="p-4 bg-neutral-950 rounded-xl border border-neutral-800 space-y-4">
                <h3 className="font-semibold text-neutral-200 text-sm">
                  Export Time-Synced Lyrics
                </h3>
                <p className="text-neutral-400 text-xs">
                  Download synchronized lyrics in standard .LRC format (compatible with Spotify,
                  Apple Music, and media players) or full JSON slide state for backup.
                </p>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={handleExportLRC}
                    className="px-4 py-2.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-medium flex items-center gap-2 cursor-pointer border border-neutral-700"
                  >
                    <Download className="w-4 h-4 text-emerald-400" />
                    <span>Download .LRC Synced Lyrics</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleExportJSON}
                    className="px-4 py-2.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-medium flex items-center gap-2 cursor-pointer border border-neutral-700"
                  >
                    <Download className="w-4 h-4 text-blue-400" />
                    <span>Download SlideDeck (.JSON)</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-neutral-950 border-t border-neutral-800 flex justify-between items-center">
          <span className="text-[11px] text-neutral-500">
            {editedSlides.length} slides ready to present
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveAndApply}
              className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 font-semibold text-xs cursor-pointer"
            >
              Save & Apply Slides
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
