import React, { useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  SkipBack,
  SkipForward,
  EyeOff,
  Maximize2,
  Minimize2,
  Tv,
  Music,
  Upload,
  Volume2,
  VolumeX,
  Radio,
  FileText,
  Palette,
  Clock,
  Box,
  Layers,
} from 'lucide-react';

interface OperatorControlsProps {
  isPlaying: boolean;
  isBlackout: boolean;
  isClearText: boolean;
  isLowerThird: boolean;
  metronome: boolean;
  tempoBpm?: number;
  isFullscreen?: boolean;
  audioSource: 'synthesizer' | 'uploaded' | 'none';
  audioFileName?: string;
  onTogglePlay: () => void;
  onReset: () => void;
  onNextSlide: () => void;
  onPrevSlide: () => void;
  onToggleBlackout: () => void;
  onToggleClearText: () => void;
  onToggleLowerThird: () => void;
  onToggleMetronome: () => void;
  onToggleFullscreen: () => void;
  onOpenProjectorPopout: () => void;
  onOpenThemeModal: () => void;
  onOpenSongEditor: () => void;
  onOpenSongLibrary?: () => void;
  onTapSync: () => void;
  isTapSyncActive: boolean;
  onToggleTapSyncMode: () => void;
  onAudioFileUpload: (file: File) => void;
  onSelectAudioSource: (src: 'synthesizer' | 'uploaded' | 'none') => void;
}

export const OperatorControls: React.FC<OperatorControlsProps> = ({
  isPlaying,
  isBlackout,
  isClearText,
  isLowerThird,
  metronome,
  tempoBpm = 68,
  isFullscreen = false,
  audioSource,
  audioFileName,
  onTogglePlay,
  onReset,
  onNextSlide,
  onPrevSlide,
  onToggleBlackout,
  onToggleClearText,
  onToggleLowerThird,
  onToggleMetronome,
  onToggleFullscreen,
  onOpenProjectorPopout,
  onOpenThemeModal,
  onOpenSongEditor,
  onOpenSongLibrary,
  onTapSync,
  isTapSyncActive,
  onToggleTapSyncMode,
  onAudioFileUpload,
  onSelectAudioSource,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onAudioFileUpload(e.target.files[0]);
    }
  };

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3 sm:p-4 flex flex-col gap-3">
      {/* Top primary controls row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Playback cluster */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onReset}
            title="Reset to beginning (Home)"
            className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onPrevSlide}
            title="Previous Slide (Left Arrow)"
            className="p-2.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition-colors cursor-pointer"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onTogglePlay}
            title="Play / Pause (Space)"
            className={`px-5 py-2.5 rounded-lg flex items-center gap-2 font-semibold text-sm transition-all cursor-pointer ${
              isPlaying
                ? 'bg-amber-500 hover:bg-amber-400 text-neutral-950 shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                : 'bg-neutral-100 hover:bg-white text-neutral-950'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4 fill-current" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Play Sync</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onNextSlide}
            title="Next Slide (Right Arrow)"
            className="p-2.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition-colors cursor-pointer"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>

        {/* Live Tap-to-Sync Button (For live church leaders or manual timing recorder) */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleTapSyncMode}
            title="Record Timings Mode (Tap to sync slides as song plays)"
            className={`px-3 py-2 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-colors cursor-pointer ${
              isTapSyncActive
                ? 'bg-rose-950/80 border-rose-500 text-rose-300 animate-pulse'
                : 'bg-neutral-800/80 hover:bg-neutral-800 border-neutral-700 text-neutral-300'
            }`}
          >
            <Radio className="w-3.5 h-3.5 text-rose-400" />
            <span>{isTapSyncActive ? 'Sync Record Mode ON' : 'Tap-To-Sync Mode'}</span>
          </button>

          {isTapSyncActive && (
            <button
              type="button"
              onClick={onTapSync}
              className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-rose-900/40 cursor-pointer animate-bounce"
            >
              TAP NOW (Stamp Time)
            </button>
          )}
        </div>

        {/* Presentation Display Actions (Blackout, Clear, Projector, Fullscreen) */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onToggleBlackout}
            title="Blackout Screen (B)"
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer flex items-center gap-1.5 ${
              isBlackout
                ? 'bg-red-500/20 border-red-500 text-red-300'
                : 'bg-neutral-800/80 hover:bg-neutral-800 border-neutral-700 text-neutral-300'
            }`}
          >
            <EyeOff className="w-3.5 h-3.5" />
            <span>Blackout (B)</span>
          </button>

          <button
            type="button"
            onClick={onToggleClearText}
            title="Clear Text Only (C)"
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer flex items-center gap-1.5 ${
              isClearText
                ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                : 'bg-neutral-800/80 hover:bg-neutral-800 border-neutral-700 text-neutral-300'
            }`}
          >
            <span className="font-mono text-xs font-bold">C</span>
            <span>Clear Lyrics</span>
          </button>

          <button
            type="button"
            onClick={onToggleLowerThird}
            title="Lower Third Mode (for video stream overlay)"
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
              isLowerThird
                ? 'bg-indigo-500/20 border-indigo-400 text-indigo-300'
                : 'bg-neutral-800/80 hover:bg-neutral-800 border-neutral-700 text-neutral-300'
            }`}
          >
            Lower-Third
          </button>

          <button
            type="button"
            onClick={onOpenProjectorPopout}
            title="Open Dedicated Projector Window (for 2nd monitor/HDMI)"
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-neutral-800/80 hover:bg-neutral-800 border border-neutral-700 text-neutral-300 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Tv className="w-3.5 h-3.5 text-blue-400" />
            <span>Projector Popout</span>
          </button>

          <button
            type="button"
            onClick={onToggleFullscreen}
            title={isFullscreen ? 'Exit Fullscreen (Esc or F)' : 'Fullscreen Slide (F)'}
            className={`p-2 rounded-lg border transition-colors cursor-pointer ${
              isFullscreen
                ? 'bg-neutral-800 text-amber-300 border-neutral-600 hover:bg-neutral-700'
                : 'bg-neutral-800/80 hover:bg-neutral-800 border-neutral-700 text-neutral-300'
            }`}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Secondary tool bar: Audio Source & Quick Editors */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-neutral-800 text-xs">
        {/* Audio engine configuration */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-neutral-400">
            <Music className="w-3.5 h-3.5 text-amber-400" />
            <span>Audio Source:</span>
          </div>

          <div className="flex items-center gap-1 p-0.5 bg-neutral-950 rounded-lg border border-neutral-800">
            <button
              type="button"
              onClick={() => onSelectAudioSource('synthesizer')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                audioSource === 'synthesizer'
                  ? 'bg-neutral-800 text-amber-300 shadow-xs'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Worship Piano & Pad (Built-in)
            </button>
            <button
              type="button"
              onClick={() => {
                if (fileInputRef.current && !audioFileName) {
                  fileInputRef.current.click();
                } else {
                  onSelectAudioSource('uploaded');
                }
              }}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                audioSource === 'uploaded'
                  ? 'bg-neutral-800 text-amber-300 shadow-xs'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Upload className="w-3 h-3" />
              <span>{audioFileName ? audioFileName.slice(0, 16) + '...' : 'Upload MP3'}</span>
            </button>
            <button
              type="button"
              onClick={() => onSelectAudioSource('none')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                audioSource === 'none'
                  ? 'bg-neutral-800 text-amber-300 shadow-xs'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Silent / Manual
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            className="hidden"
            onChange={handleFileChange}
          />

          {/* Metronome toggle */}
          <button
            type="button"
            onClick={onToggleMetronome}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs cursor-pointer transition-colors ${
              metronome
                ? 'bg-amber-950/40 border-amber-600/60 text-amber-300'
                : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-neutral-300'
            }`}
          >
            {metronome ? <Volume2 className="w-3 h-3" /> : <VolumeX className="w-3 h-3" />}
            <span>Click Metronome ({tempoBpm} BPM)</span>
          </button>
        </div>

        {/* Customization, Song Library and Song Editor Modals */}
        <div className="flex items-center gap-2">
          {onOpenSongLibrary && (
            <button
              type="button"
              onClick={onOpenSongLibrary}
              className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-amber-300 text-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-amber-500/30 hover:border-amber-400"
            >
              <Layers className="w-3.5 h-3.5 text-amber-400" />
              <span>Song Library</span>
            </button>
          )}

          <button
            type="button"
            onClick={onOpenThemeModal}
            className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-cyan-500/30 hover:border-cyan-400"
          >
            <Box className="w-3.5 h-3.5 text-cyan-400" />
            <span>3D Environments</span>
          </button>

          <button
            type="button"
            onClick={onOpenThemeModal}
            className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Palette className="w-3.5 h-3.5 text-amber-400" />
            <span>Slide Theme & Fonts</span>
          </button>

          <button
            type="button"
            onClick={onOpenSongEditor}
            className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-blue-400" />
            <span>Edit Lyrics & Splits</span>
          </button>
        </div>
      </div>
    </div>
  );
};
