import { useEffect, useMemo, useState } from "react";

function diffParts(from: Date, to: Date) {
  const ms = Math.max(0, to.getTime() - from.getTime());
  const days = Math.floor(ms / (1000*60*60*24));
  const hours = Math.floor((ms / (1000*60*60)) % 24);
  const minutes = Math.floor((ms / (1000*60)) % 60);
  const seconds = Math.floor((ms / 1000) % 60);
  return { days, hours, minutes, seconds };
}

export default function Countdown({ target }: { target: string }) {
  const targetDate = useMemo(() => new Date(target), [target]);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const { days, hours, minutes, seconds } = diffParts(now, targetDate);

  return (
    <div className="grid grid-flow-col gap-4 text-center auto-cols-max">
      {[
        { label: "Days", value: days },
        { label: "Hours", value: hours },
        { label: "Minutes", value: minutes },
        { label: "Seconds", value: seconds },
      ].map(({ label, value }) => (
        <div key={label} className="card px-4 py-3">
          <div className="text-3xl font-extrabold tabular-nums">{value}</div>
          <div className="text-xs text-dusk">{label}</div>
        </div>
      ))}
    </div>
  );
}
