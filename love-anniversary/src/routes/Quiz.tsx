import { useState } from "react";
import { questions } from "../store/questions";

export default function Quiz() {
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const q = questions[idx];

  const choose = (i: number) => {
    if (i === q.answerIndex) setScore((s) => s + 1);
    const next = idx + 1;
    if (next >= questions.length) setDone(true);
    else setIdx(next);
  };

  if (done) {
    return (
      <section className="text-center space-y-4">
        <h1 className="text-3xl font-extrabold">Your Score</h1>
        <p className="text-dusk">{score} / {questions.length}</p>
        <button className="btn-primary" onClick={() => { setIdx(0); setScore(0); setDone(false); }}>
          Play again
        </button>
      </section>
    );
  }

  return (
    <section className="max-w-xl">
      <div className="card p-6 space-y-4">
        <h2 className="text-xl font-bold">{q.q}</h2>
        <div className="grid gap-2">
          {q.options.map((opt, i) => (
            <button key={opt} className="btn-ghost text-left" onClick={() => choose(i)}>
              {opt}
            </button>
          ))}
        </div>
        <div className="text-sm text-dusk">Question {idx + 1} of {questions.length}</div>
      </div>
    </section>
  );
}
