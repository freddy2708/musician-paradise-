import React, { useState, useEffect, useRef, useCallback } from 'react';
import { defaultSlides, defaultSongMeta, defaultThemes, initialSongLibrary } from './data/defaultSong';
import { SlideItem, SongMetadata, ThemeConfig, SongPackage } from './types/lyrics';
import { PresentationCanvas } from './components/PresentationCanvas';
import { OperatorControls } from './components/OperatorControls';
import { TimelineBar } from './components/TimelineBar';
import { SlideTray } from './components/SlideTray';
import { ThemeEditorModal } from './components/ThemeEditorModal';
import { SongEditorModal } from './components/SongEditorModal';
import { SongLibraryModal } from './components/SongLibraryModal';
import { ThreeDGuideModal } from './components/ThreeDGuideModal';
import { ProjectorWindowView } from './components/ProjectorWindowView';
import { worshipSynth } from './audio/worshipSynthesizer';
import { projectorBroadcaster } from './utils/projectorSync';
import {
  Sparkles,
  Tv,
  Maximize2,
  Minimize2,
  Info,
  Keyboard,
  HelpCircle,
  Volume2,
  Music2,
  Layers,
  Box,
  FileText,
  ChevronDown,
} from 'lucide-react';

interface VendorHTMLElement extends HTMLElement {
  webkitRequestFullscreen?: () => Promise<void> | void;
  mozRequestFullScreen?: () => Promise<void> | void;
  msRequestFullscreen?: () => Promise<void> | void;
}

interface VendorDocument extends Document {
  webkitFullscreenElement?: Element;
  mozFullScreenElement?: Element;
  msFullscreenElement?: Element;
  webkitExitFullscreen?: () => Promise<void> | void;
  mozCancelFullScreen?: () => Promise<void> | void;
  msExitFullscreen?: () => Promise<void> | void;
}

const isNativeFullscreenActive = (): boolean => {
  if (typeof document === 'undefined') return false;
  const doc = document as VendorDocument;
  return Boolean(
    doc.fullscreenElement ||
    doc.webkitFullscreenElement ||
    doc.mozFullScreenElement ||
    doc.msFullscreenElement
  );
};

export default function App() {
  // Check if opened as dedicated projector popout window
  const isProjectorMode =
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).get('mode') === 'projector';

  if (isProjectorMode) {
    return <ProjectorWindowView />;
  }

  // Multi-song library state
  const [songs, setSongs] = useState<SongPackage[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('slidepraise_songs_v1');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            // Ensure God You're So Good is always present in library
            const hasGysg = parsed.some((s: SongPackage) => s.id === 'god-youre-so-good');
            if (!hasGysg) {
              const gysg = initialSongLibrary.find((s) => s.id === 'god-youre-so-good');
              if (gysg) parsed.push(gysg);
            }
            return parsed;
          }
        }
      } catch (err) {
        console.error('Failed to load songs from localStorage', err);
      }
    }
    return initialSongLibrary;
  });

  const [currentSongId, setCurrentSongId] = useState<string>(defaultSongMeta.id);

  // Primary song & slide state
  const [songMeta, setSongMeta] = useState<SongMetadata>(defaultSongMeta);
  const [slides, setSlides] = useState<SlideItem[]>(defaultSlides);
  const [theme, setTheme] = useState<ThemeConfig>(defaultThemes[0]);

  // Playback & presentation state
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [activeLineIndex, setActiveLineIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isBlackout, setIsBlackout] = useState(false);
  const [isClearText, setIsClearText] = useState(false);
  const [isLowerThird, setIsLowerThird] = useState(false);
  const [metronome, setMetronome] = useState(false);
  const [audioSource, setAudioSource] = useState<'synthesizer' | 'uploaded' | 'none'>('synthesizer');
  const [audioFileName, setAudioFileName] = useState<string | undefined>();
  const [audioFileUrl, setAudioFileUrl] = useState<string | null>(null);

  // Live Tap-to-sync mode
  const [isTapSyncActive, setIsTapSyncActive] = useState(false);

  // Modals & UI states
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [isSongLibraryOpen, setIsSongLibraryOpen] = useState(false);
  const [isSongEditorOpen, setIsSongEditorOpen] = useState(false);
  const [is3DGuideOpen, setIs3DGuideOpen] = useState(false);
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const lastWallTimeRef = useRef<number>(performance.now());
  const animationFrameRef = useRef<number | null>(null);

  // Sync synthesizer song whenever songMeta changes
  useEffect(() => {
    worshipSynth.setSong(songMeta.id, songMeta.tempoBpm);
  }, [songMeta.id, songMeta.tempoBpm]);

  // Persist song library to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && songs.length > 0) {
      try {
        localStorage.setItem('slidepraise_songs_v1', JSON.stringify(songs));
      } catch (err) {
        console.error('Failed to save songs to localStorage', err);
      }
    }
  }, [songs]);

  // Select / Switch active song
  const handleSelectSong = useCallback(
    (targetSong: SongPackage) => {
      if (isPlaying) {
        setIsPlaying(false);
        worshipSynth.stop();
        if (audioElementRef.current) audioElementRef.current.pause();
      }
      setCurrentSongId(targetSong.id);
      setSongMeta(targetSong.meta);
      setSlides(targetSong.slides);
      setCurrentSlideIndex(0);
      setActiveLineIndex(0);
      setCurrentTime(0);

      worshipSynth.setSong(targetSong.meta.id, targetSong.meta.tempoBpm);

      if (targetSong.themeId) {
        const matched = defaultThemes.find((t) => t.id === targetSong.themeId);
        if (matched) setTheme(matched);
      }
    },
    [isPlaying]
  );

  // Add new song to library
  const handleAddSong = useCallback((newSong: SongPackage) => {
    setSongs((prev) => {
      const idx = prev.findIndex((s) => s.id === newSong.id);
      if (idx !== -1) {
        const updated = [...prev];
        updated[idx] = newSong;
        return updated;
      }
      return [...prev, newSong];
    });
  }, []);

  // Update existing song
  const handleUpdateSong = useCallback(
    (updatedSong: SongPackage) => {
      setSongs((prev) => prev.map((s) => (s.id === updatedSong.id ? updatedSong : s)));
      if (updatedSong.id === currentSongId) {
        setSongMeta(updatedSong.meta);
        setSlides(updatedSong.slides);
      }
    },
    [currentSongId]
  );

  // Delete song
  const handleDeleteSong = useCallback(
    (songIdToDelete: string) => {
      if (songs.length <= 1) return;
      const remaining = songs.filter((s) => s.id !== songIdToDelete);
      setSongs(remaining);
      if (currentSongId === songIdToDelete && remaining[0]) {
        handleSelectSong(remaining[0]);
      }
    },
    [songs, currentSongId, handleSelectSong]
  );

  // Save changes from SongEditorModal
  const handleSaveSongFromEditor = useCallback(
    (newMeta: SongMetadata, newSlides: SlideItem[]) => {
      setSongMeta(newMeta);
      setSlides(newSlides);
      setSongs((prev) =>
        prev.map((s) =>
          s.id === currentSongId ? { ...s, meta: newMeta, slides: newSlides } : s
        )
      );
      worshipSynth.setSong(newMeta.id, newMeta.tempoBpm);
    },
    [currentSongId]
  );

  // Broadcast state to external projector window whenever presentation visuals change
  useEffect(() => {
    projectorBroadcaster.send({
      currentSlide: slides[currentSlideIndex] || null,
      nextSlide: slides[currentSlideIndex + 1] || null,
      activeLineIndex,
      theme,
      isBlackout,
      isClearText,
      isLowerThird,
      currentTime,
    });
  }, [
    currentSlideIndex,
    activeLineIndex,
    slides,
    theme,
    isBlackout,
    isClearText,
    isLowerThird,
    currentTime,
  ]);

  // Seek helper
  const handleSeek = useCallback(
    (targetTime: number) => {
      const clamped = Math.max(0, Math.min(targetTime, songMeta.totalDuration));
      setCurrentTime(clamped);

      if (audioSource === 'synthesizer') {
        worshipSynth.seek(clamped);
      } else if (audioSource === 'uploaded' && audioElementRef.current) {
        audioElementRef.current.currentTime = clamped;
      }
      lastWallTimeRef.current = performance.now();

      // Find matching slide
      const foundIdx = slides.findIndex(
        (s) => clamped >= s.startTime && clamped <= s.endTime
      );
      if (foundIdx !== -1) {
        setCurrentSlideIndex(foundIdx);
      } else {
        // Find closest
        let closest = 0;
        slides.forEach((s, idx) => {
          if (clamped >= s.startTime) closest = idx;
        });
        setCurrentSlideIndex(closest);
      }
    },
    [audioSource, slides, songMeta.totalDuration]
  );

  // Toggle Play / Pause
  const handleTogglePlay = useCallback(() => {
    if (isPlaying) {
      // Pause
      setIsPlaying(false);
      if (audioSource === 'synthesizer') {
        const pausedAt = worshipSynth.pause();
        setCurrentTime(pausedAt);
      } else if (audioSource === 'uploaded' && audioElementRef.current) {
        audioElementRef.current.pause();
      }
    } else {
      // Start
      setIsPlaying(true);
      lastWallTimeRef.current = performance.now();
      if (audioSource === 'synthesizer') {
        worshipSynth.setSong(songMeta.id, songMeta.tempoBpm);
        worshipSynth.start(currentTime);
      } else if (audioSource === 'uploaded' && audioElementRef.current) {
        audioElementRef.current.currentTime = currentTime;
        audioElementRef.current.play().catch(() => {
          // ignore autoplay restrictions
        });
      }
    }
  }, [isPlaying, audioSource, currentTime, songMeta.id, songMeta.tempoBpm]);

  // Main playback loop
  useEffect(() => {
    if (!isPlaying) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      return;
    }

    const tick = () => {
      let nowTime = currentTime;

      if (audioSource === 'synthesizer') {
        nowTime = worshipSynth.getCurrentTime();
      } else if (audioSource === 'uploaded' && audioElementRef.current) {
        nowTime = audioElementRef.current.currentTime;
      } else {
        const now = performance.now();
        const delta = (now - lastWallTimeRef.current) / 1000;
        lastWallTimeRef.current = now;
        nowTime = Math.min(songMeta.totalDuration, currentTime + delta);
      }

      setCurrentTime(nowTime);

      // Check if time passed the song end
      if (nowTime >= songMeta.totalDuration) {
        setIsPlaying(false);
        worshipSynth.stop();
        return;
      }

      // Check which slide should be active at nowTime
      const currentSlide = slides[currentSlideIndex];
      if (currentSlide) {
        // If currentTime went past current slide's endTime, advance to next slide!
        if (nowTime > currentSlide.endTime && currentSlideIndex < slides.length - 1) {
          const nextIdx = currentSlideIndex + 1;
          setCurrentSlideIndex(nextIdx);
        } else if (nowTime < currentSlide.startTime && currentSlideIndex > 0) {
          // In case user scrubbed backward
          const prevIdx = slides.findIndex(
            (s) => nowTime >= s.startTime && nowTime <= s.endTime
          );
          if (prevIdx !== -1) setCurrentSlideIndex(prevIdx);
        }

        // Calculate line within the active slide
        const lineIdx = currentSlide.lines.findIndex((l) => {
          if (l.endTime) {
            return nowTime >= l.startTime && nowTime <= l.endTime;
          }
          return nowTime >= l.startTime;
        });

        if (lineIdx !== -1) {
          setActiveLineIndex(lineIdx);
        } else if (nowTime > currentSlide.lines[currentSlide.lines.length - 1]?.startTime) {
          setActiveLineIndex(currentSlide.lines.length - 1);
        } else {
          setActiveLineIndex(0);
        }
      }

      animationFrameRef.current = requestAnimationFrame(tick);
    };

    animationFrameRef.current = requestAnimationFrame(tick);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [isPlaying, audioSource, currentSlideIndex, slides, songMeta.totalDuration]);

  // Metronome sync
  useEffect(() => {
    worshipSynth.setMetronome(metronome);
  }, [metronome]);

  // Jump to next slide
  const handleNextSlide = useCallback(() => {
    if (currentSlideIndex < slides.length - 1) {
      const nextIdx = currentSlideIndex + 1;
      setCurrentSlideIndex(nextIdx);
      const nextSlide = slides[nextIdx];
      if (nextSlide) {
        handleSeek(nextSlide.startTime);
      }
    }
  }, [currentSlideIndex, slides, handleSeek]);

  // Jump to prev slide
  const handlePrevSlide = useCallback(() => {
    if (currentSlideIndex > 0) {
      const prevIdx = currentSlideIndex - 1;
      setCurrentSlideIndex(prevIdx);
      const prevSlide = slides[prevIdx];
      if (prevSlide) {
        handleSeek(prevSlide.startTime);
      }
    }
  }, [currentSlideIndex, slides, handleSeek]);

  // Reset to slide 0 & 00:00
  const handleReset = useCallback(() => {
    setIsPlaying(false);
    worshipSynth.stop();
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current.currentTime = 0;
    }
    setCurrentTime(0);
    setCurrentSlideIndex(0);
    setActiveLineIndex(0);
  }, []);

  // Live Tap-to-Sync: stamps the exact moment the singer moves to next slide
  const handleTapSync = useCallback(() => {
    const stampedTime = currentTime;
    const currentIdx = currentSlideIndex;

    setSlides((prev) => {
      const updated = [...prev];
      if (updated[currentIdx]) {
        updated[currentIdx] = {
          ...updated[currentIdx],
          endTime: Math.max(updated[currentIdx].startTime + 1, stampedTime),
        };
      }
      if (currentIdx + 1 < updated.length) {
        updated[currentIdx + 1] = {
          ...updated[currentIdx + 1],
          startTime: stampedTime,
        };
      }
      return updated;
    });

    if (currentIdx < slides.length - 1) {
      setCurrentSlideIndex(currentIdx + 1);
    }
  }, [currentTime, currentSlideIndex, slides.length]);

  // Nudge timing by delta seconds
  const handleNudgeSlideTiming = useCallback(
    (index: number, delta: number) => {
      setSlides((prev) => {
        const updated = [...prev];
        const s = updated[index];
        if (!s) return prev;
        const newStart = Math.max(0, s.startTime + delta);
        const newEnd = Math.max(newStart + 1, s.endTime + delta);
        updated[index] = { ...s, startTime: newStart, endTime: newEnd };
        return updated;
      });
    },
    []
  );

  // Set slide start time to current playback time
  const handleSetSlideStartTimeToNow = useCallback(
    (index: number) => {
      setSlides((prev) => {
        const updated = [...prev];
        const s = updated[index];
        if (!s) return prev;
        const diff = s.endTime - s.startTime;
        updated[index] = {
          ...s,
          startTime: currentTime,
          endTime: currentTime + diff,
        };
        return updated;
      });
    },
    [currentTime]
  );

  const handleMoveSlide = useCallback((index: number, direction: 'up' | 'down') => {
    setSlides((prev) => {
      const targetIdx = direction === 'up' ? index - 1 : index + 1;
      if (targetIdx < 0 || targetIdx >= prev.length) return prev;
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[targetIdx];
      copy[targetIdx] = temp;
      return copy;
    });
  }, []);

  const handleDeleteSlide = useCallback((index: number) => {
    setSlides((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  const handleAddSlideAfter = useCallback((index: number) => {
    setSlides((prev) => {
      const current = prev[index];
      const newSlide: SlideItem = {
        id: `slide-${Date.now()}`,
        section: current ? current.section : 'verse',
        sectionLabel: `Slide ${prev.length + 1}`,
        startTime: current ? current.endTime : 0,
        endTime: current ? current.endTime + 15 : 15,
        lines: [{ id: `l-${Date.now()}`, text: 'New Lyric Line', startTime: current ? current.endTime : 0 }],
      };
      const copy = [...prev];
      copy.splice(index + 1, 0, newSlide);
      return copy;
    });
  }, []);

  // Audio file upload
  const handleAudioFileUpload = (file: File) => {
    const url = URL.createObjectURL(file);
    setAudioFileUrl(url);
    setAudioFileName(file.name);
    setAudioSource('uploaded');
  };

  // Safe cross-browser Fullscreen toggle (works in Chrome, Safari, Firefox, iOS, and iframe environments)
  const handleToggleFullscreen = useCallback(() => {
    setIsFullscreen((prev) => {
      const willBeFullscreen = !prev;
      const doc = document as VendorDocument;
      const isNative = isNativeFullscreenActive();

      if (willBeFullscreen) {
        const elem = containerRef.current as VendorHTMLElement | null;
        if (elem) {
          try {
            if (typeof elem.requestFullscreen === 'function') {
              elem.requestFullscreen().catch(() => {});
            } else if (typeof elem.webkitRequestFullscreen === 'function') {
              elem.webkitRequestFullscreen();
            } else if (typeof elem.mozRequestFullScreen === 'function') {
              elem.mozRequestFullScreen();
            } else if (typeof elem.msRequestFullscreen === 'function') {
              elem.msRequestFullscreen();
            }
          } catch {
            // Browsers/iframes that disallow or lack native fullscreen will smoothly use in-app fullscreen view
          }
        }
      } else {
        if (isNative) {
          try {
            if (typeof doc.exitFullscreen === 'function') {
              doc.exitFullscreen().catch(() => {});
            } else if (typeof doc.webkitExitFullscreen === 'function') {
              doc.webkitExitFullscreen();
            } else if (typeof doc.mozCancelFullScreen === 'function') {
              doc.mozCancelFullScreen();
            } else if (typeof doc.msExitFullscreen === 'function') {
              doc.msExitFullscreen();
            }
          } catch {
            // Ignore native exit error
          }
        }
      }

      return willBeFullscreen;
    });
  }, []);

  // Synchronize in-app fullscreen state if user exits via browser native controls (e.g. Esc)
  useEffect(() => {
    const handleNativeChange = () => {
      if (!isNativeFullscreenActive()) {
        setIsFullscreen(false);
      }
    };

    document.addEventListener('fullscreenchange', handleNativeChange);
    document.addEventListener('webkitfullscreenchange', handleNativeChange);
    document.addEventListener('mozfullscreenchange', handleNativeChange);
    document.addEventListener('MSFullscreenChange', handleNativeChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleNativeChange);
      document.removeEventListener('webkitfullscreenchange', handleNativeChange);
      document.removeEventListener('mozfullscreenchange', handleNativeChange);
      document.removeEventListener('MSFullscreenChange', handleNativeChange);
    };
  }, []);

  // Projector Popout window (for dual monitor / church projector)
  const handleOpenProjectorPopout = () => {
    const projectorUrl = `${window.location.origin}${window.location.pathname}?mode=projector`;
    window.open(
      projectorUrl,
      'SlidePraise_Projector',
      'width=1280,height=720,menubar=no,toolbar=no,location=no,status=no'
    );
  };

  // Global Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't capture when typing in inputs/textareas
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          if (isTapSyncActive) {
            handleTapSync();
          } else {
            handleTogglePlay();
          }
          break;
        case 'ArrowRight':
        case 'PageDown':
          e.preventDefault();
          handleNextSlide();
          break;
        case 'ArrowLeft':
        case 'PageUp':
          e.preventDefault();
          handlePrevSlide();
          break;
        case 'KeyB':
          e.preventDefault();
          setIsBlackout((prev) => !prev);
          break;
        case 'KeyC':
          e.preventDefault();
          setIsClearText((prev) => !prev);
          break;
        case 'KeyF':
          e.preventDefault();
          handleToggleFullscreen();
          break;
        case 'Escape':
          if (isFullscreen) {
            e.preventDefault();
            handleToggleFullscreen();
          }
          break;
        case 'KeyT':
          e.preventDefault();
          setIsTapSyncActive((prev) => !prev);
          break;
        case 'Home':
          e.preventDefault();
          handleReset();
          break;
        case 'Digit1':
        case 'Digit2':
        case 'Digit3':
        case 'Digit4':
        case 'Digit5':
        case 'Digit6':
        case 'Digit7':
        case 'Digit8':
        case 'Digit9': {
          const num = parseInt(e.code.replace('Digit', ''), 10);
          if (num >= 1 && num <= slides.length) {
            e.preventDefault();
            setCurrentSlideIndex(num - 1);
            handleSeek(slides[num - 1].startTime);
          }
          break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    isTapSyncActive,
    handleTapSync,
    handleTogglePlay,
    handleNextSlide,
    handlePrevSlide,
    handleReset,
    handleSeek,
    slides,
  ]);

  const currentSlide = slides[currentSlideIndex] || null;
  const nextSlide = slides[currentSlideIndex + 1] || null;

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200"
    >
      {/* Hidden audio element for uploaded user audio */}
      {audioFileUrl && (
        <audio
          ref={audioElementRef}
          src={audioFileUrl}
          preload="auto"
          onEnded={() => setIsPlaying(false)}
        />
      )}

      {/* Top Bar Contract (Single row, 3 zones) */}
      <header className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-neutral-800/80 bg-neutral-950/80 backdrop-blur-md sticky top-0 z-40">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-neutral-950 font-black shadow-md shadow-amber-500/20">
            <Music2 className="w-4 h-4 text-neutral-950" />
          </div>
          <div>
            <span className="text-base font-bold tracking-tight text-white block leading-none">
              SlidePraise
            </span>
            <span className="text-[11px] text-neutral-400 font-normal">
              Worship Slide Presenter & Time-Sync
            </span>
          </div>

          {/* Mobile Song Switch button */}
          <button
            type="button"
            onClick={() => setIsSongLibraryOpen(true)}
            className="md:hidden flex items-center gap-1.5 px-2 py-1 rounded-lg bg-neutral-900 border border-neutral-700 text-xs text-amber-300 ml-1"
          >
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            <span className="truncate max-w-[130px] font-medium">{songMeta.title}</span>
          </button>
        </div>

        {/* Zone 2: Navigation & Quick Views */}
        <nav className="hidden md:flex items-center gap-3 text-xs font-medium text-neutral-400">
          {/* Quick Song Switcher Dropdown */}
          <div className="flex items-center bg-neutral-900 border border-neutral-700/80 rounded-lg p-0.5 shadow-xs">
            <button
              type="button"
              onClick={() => setIsSongLibraryOpen(true)}
              title="Open Song Library"
              className="px-2 py-1 flex items-center gap-1.5 text-amber-300 hover:text-amber-200 transition-colors cursor-pointer"
            >
              <Layers className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-semibold text-xs">Song:</span>
            </button>
            <select
              value={currentSongId}
              onChange={(e) => {
                const found = songs.find((s) => s.id === e.target.value);
                if (found) handleSelectSong(found);
              }}
              className="bg-neutral-950 border border-neutral-800 rounded px-2 py-1 text-xs text-neutral-200 font-medium cursor-pointer focus:outline-none focus:border-amber-500 max-w-[210px] truncate"
            >
              {songs.map((s, idx) => (
                <option key={s.id} value={s.id}>
                  {idx + 1}. {s.meta.title} ({s.meta.originalKey})
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setIsSongLibraryOpen(true)}
              className="px-2 py-1 text-[11px] font-semibold text-neutral-400 hover:text-amber-300 hover:bg-neutral-800 rounded transition-colors cursor-pointer"
              title="Manage Song Library"
            >
              Library ({songs.length})
            </button>
          </div>

          <span className="text-neutral-700">·</span>
          <button
            type="button"
            onClick={() => setIsSongEditorOpen(true)}
            className="hover:text-neutral-100 transition-colors cursor-pointer flex items-center gap-1.5"
            title="Edit Lyrics & Splits for this song"
          >
            <FileText className="w-3.5 h-3.5 text-blue-400" />
            <span>Edit Lyrics</span>
          </button>
          <span className="text-neutral-700">·</span>
          <button
            type="button"
            onClick={() => setIsThemeModalOpen(true)}
            className="hover:text-neutral-100 transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Theme: {theme.name}</span>
          </button>
          <span className="text-neutral-700">·</span>
          <button
            type="button"
            onClick={() => setIsThemeModalOpen(true)}
            className="hover:text-cyan-300 transition-colors cursor-pointer flex items-center gap-1.5 text-neutral-300"
          >
            <Box className="w-3.5 h-3.5 text-cyan-400" />
            <span>
              3D: {theme.threeDEnv?.enabled ? theme.threeDEnv.sceneType.replace('-', ' ') : 'Off'}
            </span>
          </button>
          <span className="text-neutral-700">·</span>
          <button
            type="button"
            onClick={() => setIs3DGuideOpen(true)}
            className="hover:text-neutral-100 transition-colors cursor-pointer flex items-center gap-1 text-cyan-400/90"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>3D Guide</span>
          </button>
          <span className="text-neutral-700">·</span>
          <button
            type="button"
            onClick={() => setShowShortcutsHelp(!showShortcutsHelp)}
            className="hover:text-neutral-100 transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Keyboard className="w-3.5 h-3.5" />
            <span>Keys</span>
          </button>
        </nav>

        {/* Zone 3: Primary actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleOpenProjectorPopout}
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-neutral-200 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Tv className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">Projector Screen</span>
          </button>

          <button
            type="button"
            onClick={handleToggleFullscreen}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm ${
              isFullscreen
                ? 'bg-neutral-800 text-neutral-200 border border-neutral-700 hover:bg-neutral-700'
                : 'text-neutral-950 bg-amber-400 hover:bg-amber-300'
            }`}
          >
            {isFullscreen ? (
              <>
                <Minimize2 className="w-3.5 h-3.5" />
                <span>Exit Fullscreen</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Present Fullscreen</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 max-w-[1520px] w-full mx-auto p-3 sm:p-5 flex flex-col gap-4">
        {/* Shortcuts Quick Hint Banner (Collapsible) */}
        {showShortcutsHelp && (
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3 text-xs text-neutral-300 flex items-center justify-between gap-4 animate-in fade-in duration-150">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-1.5">
              <span className="font-semibold text-amber-400">Live Stage Hotkeys:</span>
              <span><kbd className="bg-neutral-800 px-1.5 py-0.5 rounded border border-neutral-700 text-neutral-200">Space</kbd> Play / Pause</span>
              <span><kbd className="bg-neutral-800 px-1.5 py-0.5 rounded border border-neutral-700 text-neutral-200">→</kbd> Next Slide</span>
              <span><kbd className="bg-neutral-800 px-1.5 py-0.5 rounded border border-neutral-700 text-neutral-200">←</kbd> Prev Slide</span>
              <span><kbd className="bg-neutral-800 px-1.5 py-0.5 rounded border border-neutral-700 text-neutral-200">B</kbd> Blackout</span>
              <span><kbd className="bg-neutral-800 px-1.5 py-0.5 rounded border border-neutral-700 text-neutral-200">C</kbd> Clear Lyrics</span>
              <span><kbd className="bg-neutral-800 px-1.5 py-0.5 rounded border border-neutral-700 text-neutral-200">F</kbd> Fullscreen</span>
              <span><kbd className="bg-neutral-800 px-1.5 py-0.5 rounded border border-neutral-700 text-neutral-200">1-9</kbd> Jump to slide</span>
            </div>
            <button
              type="button"
              onClick={() => setShowShortcutsHelp(false)}
              className="text-neutral-500 hover:text-neutral-300 p-1"
            >
              ✕
            </button>
          </div>
        )}

        {/* Primary Presentation Screen Section */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-stretch">
          {/* Main Slide Output Canvas */}
          <div className="xl:col-span-8 flex flex-col gap-2">
            <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-neutral-800 shadow-2xl bg-black">
              <PresentationCanvas
                currentSlide={currentSlide}
                nextSlide={nextSlide}
                activeLineIndex={activeLineIndex}
                currentTime={currentTime}
                theme={theme}
                isBlackout={isBlackout}
                isClearText={isClearText}
                isLowerThird={isLowerThird}
                showConfidenceFooter={true}
                isFullscreen={isFullscreen}
                aspectRatio="16:9"
                onNextSlide={handleNextSlide}
                onPrevSlide={handlePrevSlide}
                onExitFullscreen={handleToggleFullscreen}
              />
            </div>

            {/* Quick status bar beneath canvas */}
            <div className="flex items-center justify-between px-2 text-xs text-neutral-400">
              <div className="flex items-center gap-2">
                <span className="text-amber-400 font-medium">
                  {currentSlide?.sectionLabel || 'Slide'}
                </span>
                <span>·</span>
                <span className="text-neutral-400">
                  Slide {currentSlideIndex + 1} of {slides.length}
                </span>
                {isTapSyncActive && (
                  <>
                    <span>·</span>
                    <span className="text-rose-400 animate-pulse font-medium">
                      ● Tap-To-Sync Active
                    </span>
                  </>
                )}
                {theme.threeDEnv?.enabled && (
                  <>
                    <span>·</span>
                    <button
                      type="button"
                      onClick={() => setIsThemeModalOpen(true)}
                      className="text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1 cursor-pointer"
                      title="Click to customize 3D Environment"
                    >
                      <Box className="w-3 h-3" />
                      <span>3D {theme.threeDEnv.sceneType.replace('-', ' ')}</span>
                    </button>
                  </>
                )}
              </div>

              <div className="flex items-center gap-3">
                {audioSource === 'synthesizer' && (
                  <span className="text-neutral-400 flex items-center gap-1">
                    <Volume2 className="w-3 h-3 text-amber-400" />
                    Built-in Worship Piano & Pad (G Maj, 68 BPM)
                  </span>
                )}
                {isLowerThird && (
                  <span className="text-indigo-400">Lower-Third Enabled</span>
                )}
              </div>
            </div>
          </div>

          {/* Side Confidence & Next Slide Stage Monitor */}
          <div className="xl:col-span-4 flex flex-col gap-3">
            {/* Next Slide Preview Box */}
            <div className="flex-1 bg-neutral-900/90 border border-neutral-800 rounded-xl p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-neutral-800 pb-2 mb-3">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-300">
                    <span className="w-2 h-2 rounded-full bg-blue-400" />
                    <span>Next Slide Preview</span>
                  </div>
                  {nextSlide && (
                    <span className="text-[11px] font-mono text-neutral-500 tabular-nums">
                      starts at {Math.floor(nextSlide.startTime / 60)}:
                      {Math.floor(nextSlide.startTime % 60)
                        .toString()
                        .padStart(2, '0')}
                    </span>
                  )}
                </div>

                {nextSlide ? (
                  <div className="space-y-2">
                    <span className="text-xs uppercase tracking-wider text-amber-300/80 font-medium block">
                      {nextSlide.sectionLabel}
                    </span>
                    <div className="space-y-1.5 text-sm text-neutral-200 font-serif">
                      {nextSlide.lines.map((l) => (
                        <p key={l.id} className="line-clamp-2">
                          {l.text}
                        </p>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-neutral-500 text-xs">
                    This is the final slide of the song.
                  </div>
                )}
              </div>

              {/* Quick Jump Buttons for Song Sections */}
              <div className="pt-3 border-t border-neutral-800">
                <span className="text-[11px] uppercase tracking-wider text-neutral-500 block mb-2 font-medium">
                  Quick Section Navigation
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {slides
                    .filter((s, i, arr) => arr.findIndex((x) => x.sectionLabel === s.sectionLabel) === i)
                    .slice(0, 6)
                    .map((s) => {
                      const idx = slides.findIndex((x) => x.id === s.id);
                      return (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => {
                            setCurrentSlideIndex(idx);
                            handleSeek(s.startTime);
                          }}
                          className={`px-2 py-1 rounded text-xs border transition-colors cursor-pointer ${
                            currentSlide?.sectionLabel === s.sectionLabel
                              ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                              : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                          }`}
                        >
                          {s.sectionLabel}
                        </button>
                      );
                    })}
                </div>
              </div>
            </div>

            {/* Song Info & Worship Notes */}
            <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-3 text-xs text-neutral-400 flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-neutral-200">{songMeta.title}</span>
                <span className="font-mono text-amber-400">{songMeta.originalKey}</span>
              </div>
              <p className="text-[11px] text-neutral-500 leading-relaxed">
                By {songMeta.artist} · Tempo: {songMeta.tempoBpm} BPM.
                Synchronized lyrics slide system for church projection, rehearsals, and live worship.
              </p>
            </div>
          </div>
        </div>

        {/* Live Operator Controls */}
        <OperatorControls
          isPlaying={isPlaying}
          isBlackout={isBlackout}
          isClearText={isClearText}
          isLowerThird={isLowerThird}
          metronome={metronome}
          tempoBpm={songMeta.tempoBpm}
          audioSource={audioSource}
          audioFileName={audioFileName}
          onTogglePlay={handleTogglePlay}
          onReset={handleReset}
          onNextSlide={handleNextSlide}
          onPrevSlide={handlePrevSlide}
          onToggleBlackout={() => setIsBlackout((p) => !p)}
          onToggleClearText={() => setIsClearText((p) => !p)}
          onToggleLowerThird={() => setIsLowerThird((p) => !p)}
          onToggleMetronome={() => setMetronome((p) => !p)}
          isFullscreen={isFullscreen}
          onToggleFullscreen={handleToggleFullscreen}
          onOpenProjectorPopout={handleOpenProjectorPopout}
          onOpenThemeModal={() => setIsThemeModalOpen(true)}
          onOpenSongEditor={() => setIsSongEditorOpen(true)}
          onOpenSongLibrary={() => setIsSongLibraryOpen(true)}
          onTapSync={handleTapSync}
          isTapSyncActive={isTapSyncActive}
          onToggleTapSyncMode={() => setIsTapSyncActive((p) => !p)}
          onAudioFileUpload={handleAudioFileUpload}
          onSelectAudioSource={(src) => {
            if (isPlaying) {
              handleTogglePlay();
            }
            setAudioSource(src);
          }}
        />

        {/* Scrubbable Timeline Bar */}
        <TimelineBar
          slides={slides}
          currentSlideIndex={currentSlideIndex}
          currentTime={currentTime}
          totalDuration={songMeta.totalDuration}
          onSeek={handleSeek}
          onSelectSlide={(idx) => {
            setCurrentSlideIndex(idx);
            handleSeek(slides[idx].startTime);
          }}
        />

        {/* Slide Deck Grid / Tray */}
        <SlideTray
          slides={slides}
          currentSlideIndex={currentSlideIndex}
          currentTime={currentTime}
          onSelectSlide={(idx) => {
            setCurrentSlideIndex(idx);
            handleSeek(slides[idx].startTime);
          }}
          onNudgeSlideTiming={handleNudgeSlideTiming}
          onSetSlideStartTimeToNow={handleSetSlideStartTimeToNow}
          onMoveSlide={handleMoveSlide}
          onDeleteSlide={handleDeleteSlide}
          onAddSlideAfter={handleAddSlideAfter}
        />
      </main>

      {/* Theme Customization Modal */}
      <ThemeEditorModal
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
        currentTheme={theme}
        onSelectTheme={(t) => setTheme(t)}
        onUpdateTheme={(upd) => setTheme((prev) => ({ ...prev, ...upd }))}
      />

      {/* Song Library Modal */}
      <SongLibraryModal
        isOpen={isSongLibraryOpen}
        onClose={() => setIsSongLibraryOpen(false)}
        songs={songs}
        currentSongId={currentSongId}
        onSelectSong={handleSelectSong}
        onAddSong={handleAddSong}
        onUpdateSong={handleUpdateSong}
        onDeleteSong={handleDeleteSong}
        onOpenSongEditor={(targetSong) => {
          handleSelectSong(targetSong);
          setIsSongEditorOpen(true);
        }}
      />

      {/* Song Lyrics & Timing Editor Modal */}
      <SongEditorModal
        isOpen={isSongEditorOpen}
        onClose={() => setIsSongEditorOpen(false)}
        songMeta={songMeta}
        slides={slides}
        onSave={handleSaveSongFromEditor}
      />

      {/* 3D Background & Spatial Environment Guide Modal */}
      <ThreeDGuideModal
        isOpen={is3DGuideOpen}
        onClose={() => setIs3DGuideOpen(false)}
        onOpenStudio={() => setIsThemeModalOpen(true)}
      />
    </div>
  );
}
