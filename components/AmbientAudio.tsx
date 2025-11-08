'use client';
import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

export default function AmbientAudio({ src = '/audio/ambient-loop.wav' }: { src?: string }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isReady, setReady] = useState(false);
  const [isPlaying, setPlaying] = useState(false);
  const [isMuted, setMuted] = useState(true);
  const [volume, setVolume] = useState(0.2);

  useEffect(() => {
    const el = new Audio(src);
    el.loop = true;
    el.volume = volume;
    el.muted = isMuted;
    audioRef.current = el;
    setReady(true);
    return () => { el.pause(); };
  }, [src]);

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = volume;
  }, [volume]);

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.muted = isMuted;
  }, [isMuted]);

  const togglePlay = async () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      try {
        await audioRef.current.play();
        setPlaying(true);
      } catch (e) {
        console.warn('Playback failed until user interaction', e);
      }
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 backdrop-blur bg-white/5 border border-white/10 rounded-2xl px-4 py-3 flex items-center gap-3">
      <button
        onClick={togglePlay}
        className="px-3 py-1.5 rounded-xl border border-amber-400/60 text-amber-300 hover:bg-amber-400 hover:text-black transition"
        disabled={!isReady}
        aria-label={isPlaying ? 'Pause ambient audio' : 'Play ambient audio'}
      >
        {isPlaying ? 'Pause' : 'Play'}
      </button>
      <button
        onClick={() => setMuted(m => !m)}
        className="px-3 py-1.5 rounded-xl border border-gray-600 text-gray-200 hover:bg-white/10 transition"
        aria-label={isMuted ? 'Unmute' : 'Mute'}
      >
        {isMuted ? 'Unmute' : 'Mute'}
      </button>
      <input
        type="range" min={0} max={1} step={0.01}
        value={volume}
        onChange={(e) => setVolume(parseFloat(e.target.value))}
        className="w-28 accent-amber-400"
        aria-label="Volume"
      />
    </div>
  );
}
