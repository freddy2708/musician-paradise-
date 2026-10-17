import React, { useEffect, useState } from 'react';
import { PresentationCanvas } from './PresentationCanvas';
import { ProjectorPayload, projectorBroadcaster } from '../utils/projectorSync';
import { defaultThemes, defaultSlides } from '../data/defaultSong';

export const ProjectorWindowView: React.FC = () => {
  const [state, setState] = useState<ProjectorPayload>(() => {
    // Try restoring from localStorage
    try {
      const stored = localStorage.getItem('slidepraise_last_state');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // ignore
    }

    return {
      currentSlide: defaultSlides[0],
      nextSlide: defaultSlides[1] || null,
      activeLineIndex: 0,
      theme: defaultThemes[0],
      isBlackout: false,
      isClearText: false,
      isLowerThird: false,
      currentTime: 0,
    };
  });

  useEffect(() => {
    const unsubscribe = projectorBroadcaster.onReceive((payload) => {
      setState(payload);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="fixed inset-0 bg-black overflow-hidden flex flex-col justify-center items-center">
      <PresentationCanvas
        currentSlide={state.currentSlide}
        nextSlide={state.nextSlide}
        activeLineIndex={state.activeLineIndex}
        currentTime={state.currentTime}
        theme={state.theme}
        isBlackout={state.isBlackout}
        isClearText={state.isClearText}
        isLowerThird={state.isLowerThird}
        isFullscreen={true}
      />
    </div>
  );
};
