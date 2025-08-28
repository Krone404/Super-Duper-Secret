import Countdown from "../components/Countdown";

/** Set your anniversary date here (YYYY-MM-DD) */
const ANNIV_DATE = "2025-12-02";

export default function CountdownPage() {
  return (
    <section className="space-y-6">
      <h1 className="text-3xl font-extrabold">Countdown to Our Anniversary</h1>
      <p className="text-dusk">Counting down to {ANNIV_DATE} 🗓️</p>
      <Countdown target={`${ANNIV_DATE}T00:00:00`} />
    </section>
  );
}
