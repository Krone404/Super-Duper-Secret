import { useRef } from "react";
import AudioPlayer from "../components/AudioPlayer";
import SyncedLyrics from "../components/SyncedLyrics";
import { lyricsLRC } from "../store/lyrics_lrc.ts";
import { Link } from "react-router-dom";

export default function Home() {
  const audioRef = useRef<HTMLAudioElement>(null);

  return (
    <section className="grid md:grid-cols-2 gap-8 items-start">
      <div>
        <h1 className="text-5xl font-extrabold">365 Days of Us 💗</h1>
        <p className="text-dusk mt-2 text-lg">
          An interactive memory book for our first year together.
        </p>

        <div className="mt-6 flex gap-3">
          <Link to="/gallery" className="btn-primary">
            Open Gallery
          </Link>
          <Link to="/countdown" className="btn-ghost">
            Countdown
          </Link>
        </div>

        <div className="mt-6">
          <AudioPlayer
            src="/our-song.mp3"
            label="Our Song"
            audioRef={audioRef}
          />
        </div>

        <div className="mt-6">
          <SyncedLyrics audioRef={audioRef} lrc={lyricsLRC} />
        </div>
      </div>

      <img
        src="/hero.jpg"
        alt="Favourite memory"
        className="rounded-2xl shadow-md w-full object-cover aspect-[4/3]"
        onError={(e) => (e.currentTarget.style.display = "none")}
      />
    </section>
  );
}
