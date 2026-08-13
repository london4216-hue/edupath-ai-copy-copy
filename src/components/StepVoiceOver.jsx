import React, { useEffect, useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, Volume2, RotateCw, Pause, Play } from 'lucide-react';

// Generates a short voice-over line via the generateSpeech backend function
// and auto-plays it when the step mounts. Shows a small replay control.
export default function StepVoiceOver({ text, label = 'Hear it' }) {
  const [audioUrl, setAudioUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!text) return;
      setLoading(true);
      try {
        const res = await base44.functions.invoke('generateSpeech', { text });
        if (!cancelled && res?.data?.audio_url) {
          setAudioUrl(res.data.audio_url);
        }
      } catch (e) { /* ignore — stays silent */ }
      finally { if (!cancelled) setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, [text]);

  useEffect(() => {
    const el = audioRef.current;
    if (!el || !audioUrl) return;
    el.play().then(() => setPlaying(true)).catch(() => {});
  }, [audioUrl]);

  useEffect(() => () => {
    const el = audioRef.current;
    if (el) { el.pause(); }
  }, []);

  const toggle = () => {
    const el = audioRef.current;
    if (!el || !audioUrl) return;
    if (el.paused) { el.currentTime = 0; el.play().then(() => setPlaying(true)).catch(() => {}); }
    else { el.pause(); setPlaying(false); }
  };

  if (loading && !audioUrl) {
    return (
      <div className="flex items-center justify-center gap-2 text-sm font-semibold text-black/40">
        <Loader2 className="h-4 w-4 animate-spin" /> Getting the voice ready…
      </div>
    );
  }

  if (!audioUrl) return null;

  return (
    <div className="flex items-center justify-center">
      <button
        type="button"
        onClick={toggle}
        className="inline-flex items-center gap-1.5 rounded-full bg-[#EDE6FF] px-3 py-1.5 text-xs font-bold text-[#7B4FE0] active:scale-95 transition"
      >
        {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
        {playing ? 'Pause' : label}
      </button>
      <audio ref={audioRef} src={audioUrl} onEnded={() => setPlaying(false)} className="hidden" />
    </div>
  );
}