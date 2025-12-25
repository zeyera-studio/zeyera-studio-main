import React, { useEffect, useRef } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import { X } from 'lucide-react';
import Player from 'video.js/dist/types/player';

interface VideoPlayerModalProps {
  isOpen: boolean;
  videoUrl: string;
  title: string;
  onClose: () => void;
}

const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({ isOpen, videoUrl, title, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<Player | null>(null);

  useEffect(() => {
    // Only initialize player when modal is open and we have a video element
    if (!isOpen || !videoRef.current) {
      return;
    }

    // Initialize Video.js player
    const player = videojs(videoRef.current, {
      controls: true,
      autoplay: false,
      preload: 'auto',
      fluid: true,
      responsive: true,
      aspectRatio: '16:9',
      playbackRates: [0.5, 1, 1.5, 2],
      controlBar: {
        volumePanel: {
          inline: false
        }
      },
      sources: [{
        src: videoUrl,
        type: 'video/mp4'
      }]
    });

    playerRef.current = player;

    // Cleanup function
    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, [isOpen, videoUrl]);

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm">
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-50 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
        aria-label="Close video player"
      >
        <X size={24} className="text-white" />
      </button>

      {/* Video Player Container */}
      <div className="w-full max-w-6xl px-4">
        {/* Title */}
        <h2 className="text-2xl font-bold text-white mb-4 text-center">
          {title}
        </h2>

        {/* Video Player */}
        <div className="relative">
          <div data-vjs-player>
            <video
              ref={videoRef}
              className="video-js vjs-big-play-centered vjs-theme-fantasy"
              playsInline
            />
          </div>
        </div>

        {/* Instructions */}
        <p className="text-center text-gray-400 mt-4 text-sm">
          Press <kbd className="px-2 py-1 bg-white/10 rounded">ESC</kbd> or click the X button to close
        </p>
      </div>
    </div>
  );
};

export default VideoPlayerModal;

