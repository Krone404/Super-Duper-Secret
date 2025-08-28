// src/components/Countdown.tsx
import { useEffect, useMemo, useState } from "react";

export type Milestone = {
  /** Display name, e.g. "First message" */
  label: string;
  /** ISO date/time *with timezone*, e.g. "2024-10-07T21:10:00+01:00" */
  at: string;
  /** Optional subtitle under the label */
  note?: string;
};

type Parts = { days: number; hours: number; minutes: number; seconds: number };

function sinceParts(startMs: number, nowMs: number): Parts {
  const ms = Math.max(0, nowMs - startMs);
  const days = Math.floor(ms / 86_400_000);                     // 1000*60*60*24
  const hours = Math.floor((ms / 3_600_000) % 24);
  const minutes = Math.floor((ms / 60_000) % 60);
  const seconds = Math.floor((ms / 1_000) % 60);
  return { days, hours, minutes, seconds };
}

function pad2(n: number) {
  return n.toString().padStart(2, "0");
}

/** Count-up timers for one or more milestones. */
export default function Countdown({
  milestones,
  className = "",
}: {
  milestones: Milestone[];
  className?: string;
}) {
  // tick faster when visible, slower when hidden to save CPU/battery
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    let period = document.visibilityState === "hidden" ? 60_000 : 1_000;
    let id = window.setInterval(() => setNow(Date.now()), period);
    const onVis = () => {
      clearInterval(id);
      period = document.visibilityState === "hidden" ? 60_000 : 1_000;
      id = window.setInterval(() => setNow(Date.now()), period);
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  const parsed = useMemo(
    () =>
      milestones.map((m) => ({
        ...m,
        atMs: new Date(m.at).getTime(),
      })),
    [milestones]
  );

  return (
    <section className={`grid gap-4 md:grid-cols-3 ${className}`}>
      {parsed.map((m) => {
        const { days, hours, minutes, seconds } = sinceParts(m.atMs, now);
        const whenStr = new Date(m.atMs).toLocaleString(undefined, {
          year: "numeric",
          month: "short",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        });

        return (
          <article key={`${m.label}-${m.at}`} className="card p-5">
            <header className="mb-3">
              <h3 className="text-lg font-semibold text-ink">{m.label}</h3>
              <p className="text-xs text-dusk">
                since <time dateTime={m.at}>{whenStr}</time>
                {m.note ? <> · {m.note}</> : null}
              </p>
            </header>

            <div className="flex items-baseline gap-4">
              {/* Big days */}
              <div className="text-4xl font-bold tabular-nums">
                {days.toLocaleString()}
                <span className="ml-2 text-base font-normal text-dusk">days</span>
              </div>

              {/* hh:mm:ss */}
              <div
                className="text-2xl font-medium tabular-nums"
                aria-label={`${hours} hours ${minutes} minutes ${seconds} seconds`}
                title="Hours : Minutes : Seconds"
              >
                {pad2(hours)}:<span className="opacity-80">{pad2(minutes)}</span>:
                <span className="opacity-70">{pad2(seconds)}</span>
              </div>
            </div>
          </article>
        );
      })}
    </section>
  );
}
