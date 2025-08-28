import { useEffect, useMemo, useRef, useState } from "react";
import type { RefObject } from "react";
import { parseLRC } from "../utils/parseLRC.ts";
import type { LyricLine } from "../utils/parseLRC.ts";

type Props = {
  audioRef: RefObject<HTMLAudioElement | null>;
  lrc: string;
  /** Positive = show later, Negative = show earlier (seconds) */
  offsetSec?: number;
  /** How early to activate a line (seconds) */
  leadInSec?: number;
};

const MARGIN_TOP = 12;
const MARGIN_BOTTOM = 12;
const SCROLL_MS = 140; // short, subtle easing

export default function SyncedLyrics({
  audioRef,
  lrc,
  offsetSec = 0,
  leadInSec = -0.1,
}: Props) {
  const lines = useMemo<LyricLine[]>(() => parseLRC(lrc), [lrc]);

  const [active, setActive] = useState<number>(-1);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<HTMLDivElement[]>([]);
  const prevActive = useRef<number>(-1);
  const stuckBottom = useRef<boolean>(false);
  const rafId = useRef<number | null>(null);

  // repopulate refs each render for current lines
  itemRefs.current = [];

  /** binary search: last line with time <= target */
  const findActiveIndex = (t: number) => {
    let lo = 0, hi = lines.length - 1, ans = -1;
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      if (lines[mid].t <= t) { ans = mid; lo = mid + 1; }
      else hi = mid - 1;
    }
    return ans;
  };

  // cancel any ongoing scroll animation
  const cancelAnim = () => {
    if (rafId.current != null) {
      cancelAnimationFrame(rafId.current);
      rafId.current = null;
    }
  };

  // eased, short scroll (cancels previous to avoid stacking)
  const animateScrollTo = (el: HTMLElement, targetTop: number, ms = SCROLL_MS) => {
    cancelAnim();
    const startTop = el.scrollTop;
    const change = targetTop - startTop;
    if (change === 0) return;

    const start = performance.now();
    const easeOutQuad = (t: number) => t * (2 - t);

    const step = (now: number) => {
      const t = Math.min(1, (now - start) / ms);
      el.scrollTop = Math.round(startTop + change * easeOutQuad(t));
      if (t < 1) {
        rafId.current = requestAnimationFrame(step);
      } else {
        rafId.current = null;
      }
    };
    rafId.current = requestAnimationFrame(step);
  };

  // reset scroll state when lyrics change
  useEffect(() => {
    prevActive.current = -1;
    stuckBottom.current = false;
    cancelAnim();
    containerRef.current?.scrollTo({ top: 0, behavior: "auto" });
    setActive(-1);
    return cancelAnim;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lrc]);

  // update active index from audio time
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || lines.length === 0) return;

    const onTime = () => {
      const t = Math.max(0, (audio.currentTime || 0) + offsetSec - leadInSec);
      const idx = findActiveIndex(t);

      // if we moved away from the end, unpin
      if (idx < lines.length - 3 && stuckBottom.current) {
        stuckBottom.current = false;
      }

      setActive(idx);
    };

    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("seeked", onTime);
    onTime();

    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("seeked", onTime);
    };
  }, [audioRef, lines, offsetSec, leadInSec]);

  // incremental autoscroll: scroll by exactly the active line's height; sticky bottom; with easing
  useEffect(() => {
    if (active < 0) return;

    const container = containerRef.current;
    const el = itemRefs.current[active];
    if (!container || !el) return;

    const maxTop = Math.max(0, container.scrollHeight - container.clientHeight);

    // already pinned? keep pinned unless we sought up (handled above)
    if (stuckBottom.current) {
      cancelAnim();
      if (container.scrollTop !== maxTop) container.scrollTop = maxTop;
      return;
    }

    // first activation: keep at top
    if (prevActive.current === -1 && active === 0) {
      cancelAnim();
      container.scrollTop = 0;
      prevActive.current = active;
      return;
    }

    const viewTop = container.scrollTop;
    const viewBottom = viewTop + container.clientHeight;

    // item is a direct child; offsetTop is relative to the container content box
    const elTop = el.offsetTop;
    const elBottom = elTop + el.offsetHeight;

    // exact step = this active line's height
    const step = Math.max(8, Math.round(el.offsetHeight));

    let nextTop = viewTop;

    if (elTop < viewTop + MARGIN_TOP) {
      // scroll UP by one active line
      nextTop = Math.max(0, viewTop - step);
    } else if (elBottom > viewBottom - MARGIN_BOTTOM) {
      // scroll DOWN by one active line
      nextTop = Math.min(maxTop, viewTop + step);
    }

    if (nextTop !== viewTop) {
      if (nextTop >= maxTop - 1) {
        stuckBottom.current = true;
        cancelAnim();
        container.scrollTop = maxTop;
      } else {
        animateScrollTo(container, nextTop);
      }
    }

    prevActive.current = active;
    // cancel animation on unmount
    return cancelAnim;
  }, [active]);

  return (
    <div className="card p-4 max-w-xl mx-auto">
      <h2 className="text-xl font-bold mb-3">Lyrics</h2>
      <div
        ref={containerRef}
        className="max-h-72 overflow-y-auto pr-2"
      >
        {lines.map((ln, i) => (
          <div
            key={`${ln.t}-${i}`}
            ref={(el) => { if (el) itemRefs.current[i] = el; }}
            className={[
              "py-1 leading-6 whitespace-normal break-words",
              "transition-[opacity,transform,background-color] duration-150",
              i === active
                ? "opacity-100 font-semibold bg-blush/10 rounded-lg pl-2"
                : "opacity-70",
            ].join(" ")}
          >
            {ln.text}
          </div>
        ))}
      </div>
    </div>
  );
}
