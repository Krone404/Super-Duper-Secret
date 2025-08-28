import { useEffect, useRef, useState } from "react";
import type { RefObject } from "react";

export default function AudioPlayer({
  src,
  label,
  audioRef, // ✅ optional external ref so other components can sync
}: {
  src: string;
  label?: string;
  audioRef?: RefObject<HTMLAudioElement | null>;
}) {
  const innerRef = useRef<HTMLAudioElement | null>(null);
  const ref = (audioRef ?? innerRef) as RefObject<HTMLAudioElement | null>;

  const [playing, setPlaying] = useState(false);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);

  // Smooth fade-in
  const fadeInVolume = (el: HTMLAudioElement, duration = 2000) => {
    let vol = 0;
    el.volume = 0;
    const steps = 20;
    const stepTime = duration / steps;
    const id = setInterval(() => {
      if (el.paused) { clearInterval(id); return; }
      vol += 1;
      el.volume = Math.min(1, vol / steps);
      if (vol >= steps) clearInterval(id);
    }, stepTime);
  };

  // Try robust muted autoplay, then unmute + fade
  const startMutedAutoplay = async () => {
    const el = ref.current;
    if (!el) return false;
    try {
      el.muted = true;
      el.volume = 0;
      await el.play();
      setPlaying(true);
      setTimeout(() => {
        if (!el.paused) {
          el.muted = false;
          fadeInVolume(el);
        }
      }, 350);
      return true;
    } catch {
      return false;
    }
  };

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // 1) immediate try
    startMutedAutoplay().then((ok) => {
      if (ok) return;

      // 2) try when tab becomes visible/focused
      const onVisible = async () => {
        if (document.visibilityState === "visible") {
          const ok2 = await startMutedAutoplay();
          if (ok2) {
            document.removeEventListener("visibilitychange", onVisible);
            window.removeEventListener("focus", onVisible);
          } else {
            setAutoplayBlocked(true);
          }
        }
      };
      document.addEventListener("visibilitychange", onVisible);
      window.addEventListener("focus", onVisible, { once: true });

      // 3) first interaction anywhere
      const onFirstInteract = async () => {
        const ok3 = await startMutedAutoplay();
        if (!ok3) {
          try {
            el.muted = false;
            el.volume = 0;
            await el.play();
            setPlaying(true);
            fadeInVolume(el);
          } catch {}
        }
        window.removeEventListener("pointerdown", onFirstInteract);
        window.removeEventListener("keydown", onFirstInteract);
      };
      window.addEventListener("pointerdown", onFirstInteract, { once: true });
      window.addEventListener("keydown", onFirstInteract, { once: true });

      return () => {
        document.removeEventListener("visibilitychange", onVisible);
        window.removeEventListener("focus", onVisible);
        window.removeEventListener("pointerdown", onFirstInteract);
        window.removeEventListener("keydown", onFirstInteract);
      };
    });
  }, [ref]);

  const toggle = async () => {
    const el = ref.current;
    if (!el) return;
    if (el.paused) {
      try {
        el.muted = false;
        el.volume = 0;
        await el.play();
        setPlaying(true);
        fadeInVolume(el);
      } catch {}
    } else {
      await el.pause();
      setPlaying(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <button onClick={toggle} className="btn-primary" aria-pressed={playing}>
        {playing ? "Pause" : "Play"} {label ? `— ${label}` : ""}
      </button>
      {/* keep these attrs for best autoplay odds */}
      <audio ref={ref} src={src} preload="auto" autoPlay muted playsInline />
      {autoplayBlocked && (
        <span className="text-xs text-dusk">Tap anywhere or the button to start audio</span>
      )}
    </div>
  );
}
