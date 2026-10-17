import React, { useState } from 'react';
import { SongPackage, SongMetadata, SlideItem } from '../types/lyrics';
import { song1Meta, song1Slides, song2Meta, song2Slides } from '../data/songs';
import {
  X,
  Music2,
  Play,
  Plus,
  Edit3,
  Copy,
  Trash2,
  Search,
  Check,
  Download,
  Upload,
  Clock,
  Layers,
  Sparkles,
  RefreshCw,
} from 'lucide-react';

interface SongLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  songs: SongPackage[];
  currentSongId: string;
  onSelectSong: (song: SongPackage) => void;
  onAddSong: (song: SongPackage) => void;
  onUpdateSong: (updated: SongPackage) => void;
  onDeleteSong: (songId: string) => void;
  onOpenSongEditor: (song: SongPackage) => void;
}

export const SongLibraryModal: React.FC<SongLibraryModalProps> = ({
  isOpen,
  onClose,
  songs,
  currentSongId,
  onSelectSong,
  onAddSong,
  onUpdateSong,
  onDeleteSong,
  onOpenSongEditor,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'library' | 'new-song' | 'import-export'>('library');

  // Quick new song draft form
  const [newTitle, setNewTitle] = useState('');
  const [newArtist, setNewArtist] = useState('');
  const [newKey, setNewKey] = useState('G Major');
  const [newBpm, setNewBpm] = useState(72);
  const [newLyricsRaw, setNewLyricsRaw] = useState('');
  const [linesPerSlide, setLinesPerSlide] = useState(3);
  const [secondsPerSlide, setSecondsPerSlide] = useState(14);

  if (!isOpen) return null;

  const filteredSongs = songs.filter((s) => {
    const q = searchQuery.toLowerCase();
    return (
      s.meta.title.toLowerCase().includes(q) ||
      s.meta.artist.toLowerCase().includes(q) ||
      s.meta.originalKey.toLowerCase().includes(q)
    );
  });

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleDuplicateSong = (song: SongPackage) => {
    const newPkg: SongPackage = {
      id: `song-${Date.now()}`,
      meta: {
        ...song.meta,
        id: `song-${Date.now()}`,
        title: `${song.meta.title} (Copy)`,
      },
      slides: song.slides.map((sl, idx) => ({
        ...sl,
        id: `slide-copy-${Date.now()}-${idx}`,
        lines: sl.lines.map((l, lIdx) => ({
          ...l,
          id: `l-copy-${Date.now()}-${idx}-${lIdx}`,
        })),
      })),
      themeId: song.themeId,
      notes: song.notes,
    };
    onAddSong(newPkg);
  };

  const handleCreateCustomSong = () => {
    if (!newTitle.trim()) return;

    let slides: SlideItem[] = [];
    let totalDuration = 180;

    const rawLines = newLyricsRaw
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (rawLines.length > 0) {
      let currentTime = 0;
      for (let i = 0; i < rawLines.length; i += linesPerSlide) {
        const slice = rawLines.slice(i, i + linesPerSlide);
        const slideStart = currentTime;
        const slideEnd = slideStart + secondsPerSlide;
        const lineDuration = secondsPerSlide / slice.length;

        const lines = slice.map((text, idx) => ({
          id: `l-new-${Date.now()}-${i + idx}`,
          text,
          startTime: slideStart + idx * lineDuration,
          endTime: slideStart + (idx + 1) * lineDuration,
        }));

        slides.push({
          id: `slide-new-${Date.now()}-${i}`,
          section: 'verse',
          sectionLabel: `Slide ${Math.floor(i / linesPerSlide) + 1}`,
          startTime: slideStart,
          endTime: slideEnd,
          lines,
        });

        currentTime = slideEnd;
      }
      totalDuration = Math.max(currentTime, 120);
    } else {
      // Default 1 slide
      slides = [
        {
          id: `slide-new-${Date.now()}-0`,
          section: 'verse',
          sectionLabel: 'Verse 1',
          startTime: 0,
          endTime: 15,
          lines: [
            { id: `l-${Date.now()}-1`, text: `${newTitle}`, startTime: 0, endTime: 7 },
            { id: `l-${Date.now()}-2`, text: `${newArtist || 'Worship'}`, startTime: 7, endTime: 15 },
          ],
        },
      ];
    }

    const newPkg: SongPackage = {
      id: `song-${Date.now()}`,
      meta: {
        id: `song-${Date.now()}`,
        title: newTitle.trim(),
        artist: newArtist.trim() || 'Worship Leader',
        originalKey: newKey,
        tempoBpm: Number(newBpm) || 72,
        totalDuration,
      },
      slides,
    };

    onAddSong(newPkg);
    onSelectSong(newPkg);
    setActiveTab('library');
    setNewTitle('');
    setNewArtist('');
    setNewLyricsRaw('');
  };

  const handleExportLibraryJSON = () => {
    const data = JSON.stringify(songs, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SlidePraise_Song_Library_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportLibraryJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed)) {
          parsed.forEach((pkg: SongPackage) => {
            if (pkg.meta && pkg.slides) {
              onAddSong(pkg);
            }
          });
          setActiveTab('library');
        }
      } catch (err) {
        console.error('Failed to parse song library JSON', err);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-950/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Music2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-neutral-100 flex items-center gap-2">
                Song Library
                <span className="text-xs px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-400 border border-neutral-700 font-normal">
                  {songs.length} {songs.length === 1 ? 'Song' : 'Songs'}
                </span>
              </h2>
              <p className="text-xs text-neutral-400">
                Switch worship songs, edit slide lyrics & chords, or import new tracks
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center justify-between px-6 pt-3 border-b border-neutral-800 bg-neutral-900/90 text-sm">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('library')}
              className={`px-4 py-2 border-b-2 font-medium transition-colors cursor-pointer flex items-center gap-2 ${
                activeTab === 'library'
                  ? 'border-amber-400 text-amber-300'
                  : 'border-transparent text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>All Songs ({songs.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('new-song')}
              className={`px-4 py-2 border-b-2 font-medium transition-colors cursor-pointer flex items-center gap-2 ${
                activeTab === 'new-song'
                  ? 'border-amber-400 text-amber-300'
                  : 'border-transparent text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Song</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('import-export')}
              className={`px-4 py-2 border-b-2 font-medium transition-colors cursor-pointer flex items-center gap-2 ${
                activeTab === 'import-export'
                  ? 'border-amber-400 text-amber-300'
                  : 'border-transparent text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Download className="w-4 h-4" />
              <span>Backup & Import</span>
            </button>
          </div>

          {activeTab === 'library' && (
            <div className="relative pb-2">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-neutral-500" />
              <input
                type="text"
                placeholder="Search songs or artists..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-3 py-1.5 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-neutral-200 focus:outline-none focus:border-amber-500 w-56"
              />
            </div>
          )}
        </div>

        {/* Tab 1: Library list */}
        {activeTab === 'library' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {/* Quick preset banners if one is missing */}
            {!songs.some((s) => s.id === 'god-youre-so-good') && (
              <div className="bg-gradient-to-r from-emerald-950/40 to-neutral-900 border border-emerald-500/30 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <div className="text-emerald-300 font-semibold text-sm flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Preset Available: God, You’re So Good (Kristian Stanfill & Passion ‧ 2018)
                  </div>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    16 fully-timed slides with acoustic piano & ambient pad progression in Bb Major
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const pkg: SongPackage = {
                      id: song2Meta.id,
                      meta: song2Meta,
                      slides: song2Slides,
                      themeId: 'emerald-grace',
                    };
                    onAddSong(pkg);
                    onSelectSong(pkg);
                  }}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-md shadow-emerald-900/30"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add to Library & Present
                </button>
              </div>
            )}

            {!songs.some((s) => s.id === 'you-laid-aside-your-majesty') && (
              <div className="bg-gradient-to-r from-amber-950/40 to-neutral-900 border border-amber-500/30 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <div className="text-amber-300 font-semibold text-sm flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Preset Available: You Laid Aside Your Majesty (Noel Richards)
                  </div>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    16 synchronized slides with acoustic worship piano in G Major
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const pkg: SongPackage = {
                      id: song1Meta.id,
                      meta: song1Meta,
                      slides: song1Slides,
                      themeId: 'golden-glory',
                    };
                    onAddSong(pkg);
                    onSelectSong(pkg);
                  }}
                  className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-neutral-950 font-bold rounded-lg text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-md shadow-amber-900/30"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add to Library & Present
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredSongs.map((song) => {
                const isActive = song.id === currentSongId;
                return (
                  <div
                    key={song.id}
                    className={`rounded-xl border p-4.5 transition-all flex flex-col justify-between ${
                      isActive
                        ? 'bg-neutral-850 border-amber-500/80 shadow-lg shadow-amber-500/10 ring-1 ring-amber-500/50'
                        : 'bg-neutral-900/90 border-neutral-800 hover:border-neutral-700'
                    }`}
                  >
                    <div>
                      {/* Top badges */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 border border-neutral-700/60">
                          {song.meta.originalKey} · {song.meta.tempoBpm} BPM
                        </span>

                        {isActive ? (
                          <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            NOW PRESENTING
                          </span>
                        ) : (
                          <span className="text-[11px] text-neutral-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDuration(song.meta.totalDuration)}
                          </span>
                        )}
                      </div>

                      {/* Song Title & Artist */}
                      <h3 className="text-base font-bold text-neutral-100 leading-snug">
                        {song.meta.title}
                      </h3>
                      <p className="text-xs text-neutral-400 mt-0.5">
                        {song.meta.artist} {song.meta.year ? `‧ ${song.meta.year}` : ''}
                      </p>

                      {/* Slide count preview */}
                      <div className="mt-3 flex items-center gap-3 text-xs text-neutral-400">
                        <span className="flex items-center gap-1">
                          <Layers className="w-3.5 h-3.5 text-neutral-500" />
                          {song.slides.length} Slides
                        </span>
                        <span className="text-neutral-700">·</span>
                        <span className="text-neutral-500 truncate">
                          First line: &ldquo;{song.slides[1]?.lines[0]?.text || song.slides[0]?.lines[0]?.text || '...'}&rdquo;
                        </span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="mt-4 pt-3 border-t border-neutral-800/80 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            onOpenSongEditor(song);
                            onClose();
                          }}
                          title="Edit lyrics and timing"
                          className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Edit Slides</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDuplicateSong(song)}
                          title="Duplicate song deck"
                          className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-neutral-200 transition-colors cursor-pointer"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>

                        {songs.length > 1 && (
                          <button
                            type="button"
                            onClick={() => onDeleteSong(song.id)}
                            title="Delete song"
                            className="p-1.5 rounded-lg bg-neutral-800 hover:bg-red-950/40 text-neutral-500 hover:text-red-400 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          onSelectSong(song);
                          onClose();
                        }}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                          isActive
                            ? 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                            : 'bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold shadow-md shadow-amber-500/20'
                        }`}
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>{isActive ? 'Continue' : 'Present Song'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredSongs.length === 0 && (
              <div className="text-center py-12 text-neutral-500">
                <Music2 className="w-10 h-10 mx-auto text-neutral-600 mb-2" />
                <p className="text-sm">No songs found matching &ldquo;{searchQuery}&rdquo;</p>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Add New Song */}
        {activeTab === 'new-song' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            {/* Quick presets */}
            <div className="bg-neutral-950/60 border border-neutral-800 rounded-xl p-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-400 mb-2">
                Quick-Add Worship Anthems
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    const pkg: SongPackage = {
                      id: 'god-youre-so-good',
                      meta: song2Meta,
                      slides: song2Slides,
                      themeId: 'emerald-grace',
                    };
                    onAddSong(pkg);
                    onSelectSong(pkg);
                    setActiveTab('library');
                  }}
                  className="p-3 rounded-lg border border-neutral-800 bg-neutral-900 hover:border-emerald-500/60 hover:bg-neutral-850 text-left transition-all cursor-pointer flex items-center justify-between group"
                >
                  <div>
                    <div className="text-sm font-bold text-neutral-200 group-hover:text-emerald-300">
                      God, You’re So Good
                    </div>
                    <div className="text-xs text-neutral-400">
                      Kristian Stanfill & Passion (2018) · Bb Major · 70 BPM
                    </div>
                  </div>
                  <Plus className="w-4 h-4 text-emerald-400" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const pkg: SongPackage = {
                      id: 'you-laid-aside-your-majesty',
                      meta: song1Meta,
                      slides: song1Slides,
                      themeId: 'golden-glory',
                    };
                    onAddSong(pkg);
                    onSelectSong(pkg);
                    setActiveTab('library');
                  }}
                  className="p-3 rounded-lg border border-neutral-800 bg-neutral-900 hover:border-amber-500/60 hover:bg-neutral-850 text-left transition-all cursor-pointer flex items-center justify-between group"
                >
                  <div>
                    <div className="text-sm font-bold text-neutral-200 group-hover:text-amber-300">
                      You Laid Aside Your Majesty
                    </div>
                    <div className="text-xs text-neutral-400">
                      Noel Richards · G Major · 68 BPM
                    </div>
                  </div>
                  <Plus className="w-4 h-4 text-amber-400" />
                </button>
              </div>
            </div>

            {/* Custom Song Form */}
            <div className="border border-neutral-800 rounded-xl p-5 bg-neutral-950/40 space-y-4">
              <h4 className="text-sm font-bold text-neutral-100">
                Or Create Custom Song from Lyrics
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs text-neutral-400 mb-1">Song Title *</label>
                  <input
                    type="text"
                    placeholder="e.g. Goodness of God"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-sm text-neutral-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs text-neutral-400 mb-1">Artist / Band</label>
                  <input
                    type="text"
                    placeholder="e.g. Bethel Music"
                    value={newArtist}
                    onChange={(e) => setNewArtist(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-sm text-neutral-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs text-neutral-400 mb-1">Musical Key & Tempo</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Key (e.g. Ab)"
                      value={newKey}
                      onChange={(e) => setNewKey(e.target.value)}
                      className="w-1/2 px-2.5 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-xs text-neutral-100"
                    />
                    <input
                      type="number"
                      placeholder="BPM"
                      value={newBpm}
                      onChange={(e) => setNewBpm(Number(e.target.value))}
                      className="w-1/2 px-2 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-xs text-neutral-100"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs text-neutral-400 mb-1">
                  Paste Lyrics (1 line per lyric row)
                </label>
                <textarea
                  rows={6}
                  placeholder={`Paste full lyrics here...\nLine 1\nLine 2\nLine 3\n...`}
                  value={newLyricsRaw}
                  onChange={(e) => setNewLyricsRaw(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-xs font-mono text-neutral-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-neutral-400">
                <div className="flex items-center gap-4">
                  <div>
                    Lines per slide:{' '}
                    <input
                      type="number"
                      min={1}
                      max={6}
                      value={linesPerSlide}
                      onChange={(e) => setLinesPerSlide(Number(e.target.value))}
                      className="w-12 px-2 py-1 bg-neutral-900 border border-neutral-700 rounded text-center text-white"
                    />
                  </div>
                  <div>
                    Seconds per slide:{' '}
                    <input
                      type="number"
                      min={5}
                      max={60}
                      value={secondsPerSlide}
                      onChange={(e) => setSecondsPerSlide(Number(e.target.value))}
                      className="w-12 px-2 py-1 bg-neutral-900 border border-neutral-700 rounded text-center text-white"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCreateCustomSong}
                  disabled={!newTitle.trim()}
                  className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-neutral-950 font-bold text-xs flex items-center gap-2 cursor-pointer transition-colors shadow-md shadow-amber-500/20"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create & Open Song</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Backup & Import */}
        {activeTab === 'import-export' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-neutral-950/60 border border-neutral-800 rounded-xl p-5 flex flex-col justify-between">
                <div>
                  <h4 className="text-sm font-bold text-neutral-100 flex items-center gap-2 mb-2">
                    <Download className="w-4 h-4 text-amber-400" />
                    Export Complete Song Library
                  </h4>
                  <p className="text-xs text-neutral-400 leading-relaxed mb-4">
                    Download all {songs.length} worship songs with their slide timings, sections, and chord maps as a portable JSON file.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleExportLibraryJSON}
                  className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors border border-neutral-700"
                >
                  <Download className="w-4 h-4" />
                  Download Library (.JSON)
                </button>
              </div>

              <div className="bg-neutral-950/60 border border-neutral-800 rounded-xl p-5 flex flex-col justify-between">
                <div>
                  <h4 className="text-sm font-bold text-neutral-100 flex items-center gap-2 mb-2">
                    <Upload className="w-4 h-4 text-emerald-400" />
                    Import Songs from JSON
                  </h4>
                  <p className="text-xs text-neutral-400 leading-relaxed mb-4">
                    Load exported SlidePraise songs or shared song decks from another church team or computer.
                  </p>
                </div>
                <label className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors border border-neutral-700">
                  <Upload className="w-4 h-4" />
                  <span>Choose File to Import</span>
                  <input
                    type="file"
                    accept=".json"
                    className="hidden"
                    onChange={handleImportLibraryJSON}
                  />
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-neutral-800 bg-neutral-950/80 text-xs text-neutral-400">
          <span>Active: {songs.find((s) => s.id === currentSongId)?.meta.title}</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-medium transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
