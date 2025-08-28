export type LyricLine = { t: number; text: string };

const timeToSeconds = (mm: string, ss: string, cs?: string) => {
  const m = parseInt(mm, 10) || 0;
  const s = parseFloat(ss) || 0;
  const c = cs ? parseFloat(`0.${cs}`) : 0;
  return m * 60 + s + c;
};

/** Accepts standard LRC with lines like [mm:ss.xx]Text */
export function parseLRC(lrc: string): LyricLine[] {
  const lines: LyricLine[] = [];
  const re = /\[(\d{2}):(\d{2})(?:\.(\d{1,2}))?\](.*)/g;

  lrc.split(/\r?\n/).forEach((raw) => {
    let m: RegExpExecArray | null;
    re.lastIndex = 0;
    m = re.exec(raw);
    if (!m) return;
    const [, mm, ss, cs, text] = m;
    const t = timeToSeconds(mm, ss, cs);
    const cleaned = (text || "").trim();
    if (cleaned) lines.push({ t, text: cleaned });
  });

  return lines.sort((a, b) => a.t - b.t);
}
