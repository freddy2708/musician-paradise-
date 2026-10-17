import React from 'react';
import { ThemeConfig } from '../types/lyrics';
import { defaultThemes } from '../data/defaultSong';
import { X, Check, Sparkles, Type, AlignCenter, AlignLeft, AlignRight } from 'lucide-react';

interface ThemeEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: ThemeConfig;
  onSelectTheme: (theme: ThemeConfig) => void;
  onUpdateTheme: (updated: Partial<ThemeConfig>) => void;
}

export const ThemeEditorModal: React.FC<ThemeEditorModalProps> = ({
  isOpen,
  onClose,
  currentTheme,
  onSelectTheme,
  onUpdateTheme,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-semibold text-neutral-100">
              Slide Theme & Typography Settings
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm">
          {/* Preset Themes */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-3">
              Preset Worship Themes
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {defaultThemes.map((t) => {
                const isSelected = currentTheme.id === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => onSelectTheme(t)}
                    style={{ background: t.bgGradient }}
                    className={`relative h-20 rounded-xl p-3 text-left border flex flex-col justify-between overflow-hidden cursor-pointer transition-all ${
                      isSelected
                        ? 'border-amber-400 ring-2 ring-amber-400 shadow-lg'
                        : 'border-neutral-700/60 hover:border-neutral-500 opacity-80 hover:opacity-100'
                    }`}
                  >
                    <span className="text-xs font-bold text-white drop-shadow">
                      {t.name}
                    </span>
                    <span className="text-[10px] text-neutral-300 font-serif line-clamp-1 drop-shadow">
                      {t.fontFamily}
                    </span>
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-5 h-5 bg-amber-400 text-neutral-950 rounded-full flex items-center justify-center">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Typography */}
          <div className="border-t border-neutral-800 pt-5 space-y-4">
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400">
              Typography & Presentation Style
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Font family */}
              <div>
                <span className="text-xs text-neutral-400 block mb-1.5">Font Family</span>
                <div className="grid grid-cols-2 gap-1.5">
                  {(
                    [
                      'Cormorant Garamond',
                      'Cinzel',
                      'Plus Jakarta Sans',
                      'Syne',
                    ] as const
                  ).map((font) => (
                    <button
                      key={font}
                      type="button"
                      onClick={() => onUpdateTheme({ fontFamily: font })}
                      className={`p-2 rounded-lg border text-xs text-left cursor-pointer transition-colors ${
                        currentTheme.fontFamily === font
                          ? 'border-amber-400 bg-amber-500/10 text-amber-300 font-semibold'
                          : 'border-neutral-800 bg-neutral-950 hover:bg-neutral-800 text-neutral-300'
                      }`}
                    >
                      <span className="line-clamp-1">{font}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Font size */}
              <div>
                <span className="text-xs text-neutral-400 block mb-1.5">Slide Text Size</span>
                <div className="grid grid-cols-4 gap-1.5">
                  {(['small', 'medium', 'large', 'huge'] as const).map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => onUpdateTheme({ fontSize: size })}
                      className={`py-2 px-1 rounded-lg border text-xs text-center capitalize cursor-pointer transition-colors ${
                        currentTheme.fontSize === size
                          ? 'border-amber-400 bg-amber-500/10 text-amber-300 font-semibold'
                          : 'border-neutral-800 bg-neutral-950 hover:bg-neutral-800 text-neutral-300'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Text Alignment */}
              <div>
                <span className="text-xs text-neutral-400 block mb-1.5">Text Alignment</span>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => onUpdateTheme({ textAlign: 'left' })}
                    className={`flex-1 py-2 rounded-lg border text-xs flex items-center justify-center gap-1 cursor-pointer ${
                      currentTheme.textAlign === 'left'
                        ? 'border-amber-400 bg-amber-500/10 text-amber-300'
                        : 'border-neutral-800 bg-neutral-950 text-neutral-400'
                    }`}
                  >
                    <AlignLeft className="w-3.5 h-3.5" /> Left
                  </button>
                  <button
                    type="button"
                    onClick={() => onUpdateTheme({ textAlign: 'center' })}
                    className={`flex-1 py-2 rounded-lg border text-xs flex items-center justify-center gap-1 cursor-pointer ${
                      currentTheme.textAlign === 'center'
                        ? 'border-amber-400 bg-amber-500/10 text-amber-300'
                        : 'border-neutral-800 bg-neutral-950 text-neutral-400'
                    }`}
                  >
                    <AlignCenter className="w-3.5 h-3.5" /> Center
                  </button>
                  <button
                    type="button"
                    onClick={() => onUpdateTheme({ textAlign: 'right' })}
                    className={`flex-1 py-2 rounded-lg border text-xs flex items-center justify-center gap-1 cursor-pointer ${
                      currentTheme.textAlign === 'right'
                        ? 'border-amber-400 bg-amber-500/10 text-amber-300'
                        : 'border-neutral-800 bg-neutral-950 text-neutral-400'
                    }`}
                  >
                    <AlignRight className="w-3.5 h-3.5" /> Right
                  </button>
                </div>
              </div>

              {/* Text Case */}
              <div>
                <span className="text-xs text-neutral-400 block mb-1.5">Text Capitalization</span>
                <div className="flex gap-1.5">
                  {(
                    [
                      { id: 'none', label: 'As Written' },
                      { id: 'uppercase', label: 'UPPERCASE' },
                      { id: 'capitalize', label: 'Title Case' },
                    ] as const
                  ).map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => onUpdateTheme({ textTransform: c.id })}
                      className={`flex-1 py-2 rounded-lg border text-xs text-center cursor-pointer transition-colors ${
                        currentTheme.textTransform === c.id
                          ? 'border-amber-400 bg-amber-500/10 text-amber-300'
                          : 'border-neutral-800 bg-neutral-950 text-neutral-400'
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 3D Hardware-Accelerated Environment Studio */}
          <div className="border-t border-neutral-800 pt-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                    3D Spatial Environment Engine
                  </span>
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded border border-amber-500/30 font-medium">
                    WebGL Three.js
                  </span>
                </div>
                <span className="text-[11px] text-neutral-400 block mt-0.5">
                  Real-time 3D volumetric atmospheres, kinetic waves, and celestial geometry
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={currentTheme.threeDEnv?.enabled ?? false}
                  onChange={(e) => {
                    const isEn = e.target.checked;
                    onUpdateTheme({
                      threeDEnv: {
                        enabled: isEn,
                        sceneType: currentTheme.threeDEnv?.sceneType && currentTheme.threeDEnv.sceneType !== 'none'
                          ? currentTheme.threeDEnv.sceneType
                          : 'cathedral-rays',
                        primaryColor: currentTheme.threeDEnv?.primaryColor || '#f59e0b',
                        secondaryColor: currentTheme.threeDEnv?.secondaryColor || '#6366f1',
                        speed: currentTheme.threeDEnv?.speed || 1.0,
                        cameraMotion: currentTheme.threeDEnv?.cameraMotion || 'gentle-drift',
                        bloomIntensity: currentTheme.threeDEnv?.bloomIntensity || 0.8,
                        contrastScrimOpacity: currentTheme.threeDEnv?.contrastScrimOpacity || 0.35,
                        particleCount: currentTheme.threeDEnv?.particleCount || 1200,
                      },
                    });
                  }}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
              </label>
            </div>

            {currentTheme.threeDEnv?.enabled && (
              <div className="p-4 bg-neutral-950/80 rounded-xl border border-neutral-800 space-y-4 animate-in fade-in duration-200">
                {/* 3D Scene Selection */}
                <div>
                  <span className="text-xs text-neutral-300 font-medium block mb-2">
                    Choose 3D Environment Scene
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      {
                        id: 'cathedral-rays',
                        title: 'Cathedral Rays',
                        desc: 'Volumetric light beams & rising motes',
                      },
                      {
                        id: 'celestial-nebula',
                        title: 'Celestial Nebula',
                        desc: '3D starfield & orbital cosmic rings',
                      },
                      {
                        id: 'kinetic-waves',
                        title: 'Ocean of Grace',
                        desc: 'Undulating 3D harmonic terrain grid',
                      },
                      {
                        id: 'sacred-halo',
                        title: 'Sacred Rings',
                        desc: 'Interlocking dual toroids & glowing core',
                      },
                      {
                        id: 'constellation',
                        title: 'Constellation',
                        desc: 'Interconnected 3D particle nodes',
                      },
                    ].map((sc) => {
                      const isCur = currentTheme.threeDEnv?.sceneType === sc.id;
                      return (
                        <button
                          key={sc.id}
                          type="button"
                          onClick={() => {
                            if (!currentTheme.threeDEnv) return;
                            onUpdateTheme({
                              threeDEnv: {
                                ...currentTheme.threeDEnv,
                                sceneType: sc.id as any,
                              },
                            });
                          }}
                          className={`p-2.5 rounded-lg border text-left cursor-pointer transition-all ${
                            isCur
                              ? 'border-amber-400 bg-amber-500/15 text-amber-200 ring-1 ring-amber-400'
                              : 'border-neutral-800 bg-neutral-900 hover:bg-neutral-850 text-neutral-300'
                          }`}
                        >
                          <span className="text-xs font-semibold block">{sc.title}</span>
                          <span className="text-[10px] text-neutral-400 line-clamp-1 block mt-0.5">
                            {sc.desc}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Camera Motion */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <span className="text-[11px] text-neutral-400 block mb-1">
                      Camera Choreography
                    </span>
                    <div className="flex gap-1.5">
                      {[
                        { id: 'gentle-drift', label: 'Gentle Drift' },
                        { id: 'orbit', label: 'Slow Orbit' },
                        { id: 'interactive', label: 'Mouse Tilt' },
                      ].map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => {
                            if (!currentTheme.threeDEnv) return;
                            onUpdateTheme({
                              threeDEnv: {
                                ...currentTheme.threeDEnv,
                                cameraMotion: m.id as any,
                              },
                            });
                          }}
                          className={`flex-1 py-1.5 px-2 rounded-lg border text-xs text-center cursor-pointer transition-colors ${
                            currentTheme.threeDEnv?.cameraMotion === m.id
                              ? 'border-amber-400 bg-amber-500/15 text-amber-300'
                              : 'border-neutral-800 bg-neutral-900 text-neutral-400'
                          }`}
                        >
                          {m.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Flow Speed Multiplier */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[11px] text-neutral-400">Atmosphere Motion Speed</span>
                      <span className="text-[11px] font-mono text-amber-400">
                        {currentTheme.threeDEnv.speed.toFixed(1)}x
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.3"
                      max="2.5"
                      step="0.1"
                      value={currentTheme.threeDEnv.speed}
                      onChange={(e) => {
                        if (!currentTheme.threeDEnv) return;
                        onUpdateTheme({
                          threeDEnv: {
                            ...currentTheme.threeDEnv,
                            speed: parseFloat(e.target.value),
                          },
                        });
                      }}
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Color Palettes & Scrim Contrast */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 border-t border-neutral-800/60">
                  <div>
                    <span className="text-[11px] text-neutral-400 block mb-1">Primary Tone</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={currentTheme.threeDEnv.primaryColor}
                        onChange={(e) => {
                          if (!currentTheme.threeDEnv) return;
                          onUpdateTheme({
                            threeDEnv: {
                              ...currentTheme.threeDEnv,
                              primaryColor: e.target.value,
                            },
                          });
                        }}
                        className="w-8 h-8 rounded border border-neutral-700 bg-neutral-900 cursor-pointer"
                      />
                      <span className="text-xs font-mono text-neutral-300">
                        {currentTheme.threeDEnv.primaryColor}
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[11px] text-neutral-400 block mb-1">Secondary Tone</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={currentTheme.threeDEnv.secondaryColor}
                        onChange={(e) => {
                          if (!currentTheme.threeDEnv) return;
                          onUpdateTheme({
                            threeDEnv: {
                              ...currentTheme.threeDEnv,
                              secondaryColor: e.target.value,
                            },
                          });
                        }}
                        className="w-8 h-8 rounded border border-neutral-700 bg-neutral-900 cursor-pointer"
                      />
                      <span className="text-xs font-mono text-neutral-300">
                        {currentTheme.threeDEnv.secondaryColor}
                      </span>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[11px] text-neutral-400">Lyrics Contrast Scrim</span>
                      <span className="text-[11px] font-mono text-amber-400">
                        {Math.round(currentTheme.threeDEnv.contrastScrimOpacity * 100)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.1"
                      max="0.85"
                      step="0.05"
                      value={currentTheme.threeDEnv.contrastScrimOpacity}
                      onChange={(e) => {
                        if (!currentTheme.threeDEnv) return;
                        onUpdateTheme({
                          threeDEnv: {
                            ...currentTheme.threeDEnv,
                            contrastScrimOpacity: parseFloat(e.target.value),
                          },
                        });
                      }}
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                    <span className="text-[10px] text-neutral-500 block mt-0.5">
                      Ensures high text legibility on projectors
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Karaoke & Particles */}
          <div className="border-t border-neutral-800 pt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Active line highlighting */}
            <div className="flex items-center justify-between p-3 bg-neutral-950 rounded-xl border border-neutral-800">
              <div>
                <span className="text-xs font-semibold text-neutral-200 block">
                  Active Line Highlight (Karaoke Sync)
                </span>
                <span className="text-[11px] text-neutral-500">
                  Glows current line according to time-sync
                </span>
              </div>
              <input
                type="checkbox"
                checked={currentTheme.activeLineGlow}
                onChange={(e) => onUpdateTheme({ activeLineGlow: e.target.checked })}
                className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
              />
            </div>

            {/* Ambient Celestial Particles */}
            <div className="flex items-center justify-between p-3 bg-neutral-950 rounded-xl border border-neutral-800">
              <div>
                <span className="text-xs font-semibold text-neutral-200 block">
                  Dynamic Floating Light Motes
                </span>
                <span className="text-[11px] text-neutral-500">
                  Ambient canvas dust particles
                </span>
              </div>
              <input
                type="checkbox"
                checked={currentTheme.enableParticles}
                onChange={(e) => onUpdateTheme({ enableParticles: e.target.checked })}
                className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-neutral-950 border-t border-neutral-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 font-semibold text-xs cursor-pointer"
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
};
