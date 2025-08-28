// src/routes/CountdownPage.tsx
import Countdown from "../components/Countdown";

export default function CountdownPage() {
  return (
    <section className="space-y-6">
      <h1 className="text-3xl font-extrabold">Time Since Our Special Moments</h1>
      <p className="text-dusk">Live counters that update every second 💖</p>

      <Countdown
        milestones={[
          { label: "Our very first message", at: "2024-11-04T00:00:00+00:00", note: "12 days later, you responded!" },
          { label: "Our first date",            at: "2024-11-26T00:00:00+00:00", note: "The day that I fell in love." },
          { label: "We became offical",              at: "2024-12-02T00:00:00+00:00", note: "and be together forever!" },
        ]}
      />
    </section>
  );
}
