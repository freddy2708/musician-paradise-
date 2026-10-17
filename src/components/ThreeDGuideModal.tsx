import React from 'react';
import { X, Box, Sparkles, Layers, Eye, Compass, Sun, ShieldCheck } from 'lucide-react';

interface ThreeDGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenStudio: () => void;
}

export const ThreeDGuideModal: React.FC<ThreeDGuideModalProps> = ({
  isOpen,
  onClose,
  onOpenStudio,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Box className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-neutral-100">
                How to Design 3D Backgrounds & Spatial Environments
              </h2>
              <p className="text-[11px] text-neutral-400">
                Architectural principles for worship lyrics, church projection, and stage media
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-neutral-300 leading-relaxed">
          {/* Hero Banner Summary */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-neutral-950 via-neutral-900 to-cyan-950/30 border border-cyan-900/40 space-y-2">
            <span className="text-cyan-400 font-semibold text-xs uppercase tracking-wider block">
              The Golden Rule of Worship 3D Backgrounds
            </span>
            <p className="text-neutral-200 text-sm font-medium">
              "The background must create sacred atmosphere and emotional depth without competing with the Word."
            </p>
            <p className="text-neutral-400 text-xs">
              Unlike 3D games where models are the central subject, worship stage 3D environments serve as a living canvas. Text legibility and emotional reverence always take priority.
            </p>
          </div>

          {/* 5 Core Design Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Pillar 1: Contrast & Scrims */}
            <div className="p-3.5 bg-neutral-950 rounded-xl border border-neutral-800 space-y-1.5">
              <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs">
                <ShieldCheck className="w-4 h-4" />
                <span>1. Text Contrast & Scrim Discipline</span>
              </div>
              <p className="text-neutral-400 text-[11px]">
                High-intensity 3D lights and glowing bloom can wash out white lyrics. Always place a calibrated black scrim layer (<span className="text-amber-300 font-mono">30%–45% opacity</span>) and subtle radial edge vignette between the WebGL canvas and DOM text.
              </p>
            </div>

            {/* Pillar 2: Camera Choreography */}
            <div className="p-3.5 bg-neutral-950 rounded-xl border border-neutral-800 space-y-1.5">
              <div className="flex items-center gap-2 text-cyan-400 font-semibold text-xs">
                <Compass className="w-4 h-4" />
                <span>2. Reverent Camera Choreography</span>
              </div>
              <p className="text-neutral-400 text-[11px]">
                Avoid abrupt camera snaps or aggressive rotation. Use continuous low-velocity drift (<span className="text-cyan-300 font-mono">0.05–0.15 rad/s</span>) or slow circular orbital sweeps that match the song's tempo (60–75 BPM ballad pace).
              </p>
            </div>

            {/* Pillar 3: Atmospheric Depth & Fog */}
            <div className="p-3.5 bg-neutral-950 rounded-xl border border-neutral-800 space-y-1.5">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs">
                <Layers className="w-4 h-4" />
                <span>3. Atmospheric Depth & Exponential Fog</span>
              </div>
              <p className="text-neutral-400 text-[11px]">
                Use <code className="bg-neutral-800 px-1 rounded text-emerald-300 font-mono">scene.fog = new THREE.FogExp2(0x050508, 0.0025)</code> to soften the horizon and give realistic scale. Add volumetric light beams (inverted open cylinders with additive blending) to evoke divine sanctuary rays.
              </p>
            </div>

            {/* Pillar 4: Spatial Geometry & Archetypes */}
            <div className="p-3.5 bg-neutral-950 rounded-xl border border-neutral-800 space-y-1.5">
              <div className="flex items-center gap-2 text-purple-400 font-semibold text-xs">
                <Sun className="w-4 h-4" />
                <span>4. Archetypal Worship 3D Themes</span>
              </div>
              <ul className="text-neutral-400 text-[11px] list-disc list-inside space-y-1">
                <li><strong className="text-purple-300">Cathedral Rays:</strong> God-rays + rising dust motes.</li>
                <li><strong className="text-purple-300">Celestial Nebula:</strong> 3D starfields and cosmic rings.</li>
                <li><strong className="text-purple-300">Ocean of Grace:</strong> Undulating sine-wave mesh terrain.</li>
                <li><strong className="text-purple-300">Sacred Rings:</strong> Interlocking gold toroids.</li>
              </ul>
            </div>
          </div>

          {/* Practical Implementation Architecture */}
          <div className="p-4 bg-neutral-950 rounded-xl border border-neutral-800 space-y-3">
            <span className="text-xs font-semibold text-neutral-200 block">
              WebGL Layering Architecture in SlidePraise
            </span>
            <div className="font-mono text-[11px] p-3 rounded-lg bg-neutral-900 border border-neutral-800 space-y-1 text-neutral-300">
              <div className="text-neutral-500">{"// Stack order from back to front:"}</div>
              <div>Layer 0: <span className="text-blue-400">&lt;ThreeDBackground /&gt;</span> (Hardware WebGL Scene, Camera, Particles)</div>
              <div>Layer 1: <span className="text-amber-400">&lt;div class="scrim" /&gt;</span> (35% Black alpha scrim + radial vignette)</div>
              <div>Layer 2: <span className="text-emerald-400">&lt;DOM Typography /&gt;</span> (Selectable lyrics with text-shadow glow)</div>
              <div>Layer 3: <span className="text-purple-400">&lt;BroadcastSync /&gt;</span> (BroadcastChannel syncs 3D state to Projector Popout)</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-neutral-950 border-t border-neutral-800 flex justify-between items-center">
          <span className="text-[11px] text-neutral-400">
            SlidePraise is equipped with real-time Three.js WebGL environments
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs cursor-pointer"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenStudio();
              }}
              className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 font-semibold text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Customize 3D Environments</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
