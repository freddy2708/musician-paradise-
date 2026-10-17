import { SlideItem, ThemeConfig } from '../types/lyrics';

export interface ProjectorPayload {
  currentSlide: SlideItem | null;
  nextSlide: SlideItem | null;
  activeLineIndex: number;
  theme: ThemeConfig;
  isBlackout: boolean;
  isClearText: boolean;
  isLowerThird: boolean;
  currentTime: number;
}

const CHANNEL_NAME = 'slidepraise_projector_channel';

class ProjectorBroadcaster {
  private channel: BroadcastChannel | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      this.channel = new BroadcastChannel(CHANNEL_NAME);
    }
  }

  public send(payload: ProjectorPayload) {
    if (this.channel) {
      this.channel.postMessage(payload);
    }
    try {
      localStorage.setItem('slidepraise_last_state', JSON.stringify(payload));
    } catch {
      // ignore
    }
  }

  public onReceive(callback: (payload: ProjectorPayload) => void): () => void {
    if (this.channel) {
      const handler = (event: MessageEvent<ProjectorPayload>) => {
        if (event.data) {
          callback(event.data);
        }
      };
      this.channel.addEventListener('message', handler);
      return () => {
        this.channel?.removeEventListener('message', handler);
      };
    }

    // Fallback via storage event
    const storageHandler = (e: StorageEvent) => {
      if (e.key === 'slidepraise_last_state' && e.newValue) {
        try {
          callback(JSON.parse(e.newValue));
        } catch {
          // ignore
        }
      }
    };
    window.addEventListener('storage', storageHandler);
    return () => window.removeEventListener('storage', storageHandler);
  }
}

export const projectorBroadcaster = new ProjectorBroadcaster();
