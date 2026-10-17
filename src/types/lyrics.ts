export interface LyricLine {
  id: string;
  text: string;
  startTime: number; // in seconds
  endTime?: number;
}

export type SectionType = 'intro' | 'verse' | 'chorus' | 'bridge' | 'vamp' | 'outro' | 'instrumental';

export interface SlideItem {
  id: string;
  section: SectionType;
  sectionLabel: string;
  startTime: number; // in seconds
  endTime: number; // in seconds
  lines: LyricLine[];
  notes?: string;
}

export interface SongMetadata {
  id: string;
  title: string;
  artist: string;
  originalKey: string;
  tempoBpm: number;
  totalDuration: number; // seconds
  year?: string;
}

export interface SongPackage {
  id: string;
  meta: SongMetadata;
  slides: SlideItem[];
  themeId?: string;
  notes?: string;
}

export interface ThemeConfig {
  id: string;
  name: string;
  backgroundType: 'particles-gold' | 'particles-blue' | 'gradient-dawn' | 'minimal-dark' | 'emerald' | 'custom-gradient';
  bgGradient: string;
  fontFamily: 'Cormorant Garamond' | 'Cinzel' | 'Plus Jakarta Sans' | 'Syne';
  fontSize: 'small' | 'medium' | 'large' | 'huge';
  fontWeight: 'normal' | 'medium' | 'semibold' | 'bold';
  textAlign: 'center' | 'left' | 'right';
  layoutPosition: 'center' | 'bottom-third' | 'top';
  textTransform: 'none' | 'uppercase' | 'capitalize';
  textColor: string;
  highlightColor: string;
  activeLineGlow: boolean;
  textShadow: 'none' | 'soft' | 'strong' | 'theatrical';
  enableParticles: boolean;
  particleDensity: 'low' | 'medium' | 'high';
  threeDEnv?: ThreeDEnvironmentConfig;
}

export type ThreeDSceneType =
  | 'none'
  | 'celestial-nebula'
  | 'cathedral-rays'
  | 'kinetic-waves'
  | 'sacred-halo'
  | 'constellation';

export interface ThreeDEnvironmentConfig {
  enabled: boolean;
  sceneType: ThreeDSceneType;
  primaryColor: string; // hex
  secondaryColor: string; // hex
  speed: number; // multiplier 0.2 to 2.5
  cameraMotion: 'orbit' | 'fly-forward' | 'gentle-drift' | 'interactive';
  bloomIntensity: number; // 0 to 1
  contrastScrimOpacity: number; // 0.1 to 0.9 for readability
  particleCount: number; // 500 to 3000
}

export interface PresentationState {
  currentSlideIndex: number;
  activeLineIndex: number;
  isPlaying: boolean;
  currentTime: number;
  playbackRate: number;
  isBlackout: boolean;
  isClearText: boolean;
  isLowerThird: boolean;
  isConfidenceMonitor: boolean;
  autoAdvance: boolean;
  audioSource: 'synthesizer' | 'uploaded' | 'none';
  audioFileName?: string;
  metronome: boolean;
}
