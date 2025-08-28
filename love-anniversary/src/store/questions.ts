export type Q = {
  q: string;
  options: string[];
  answerIndex: number;
};
export const questions: Q[] = [
  { q: "Where did we first meet?", options: ["Library", "Beach", "Cafe", "Uni"], answerIndex: 2 },
  { q: "Who said I love you first?", options: ["Me", "You"], answerIndex: 1 },
  { q: "Our favorite cuisine?", options: ["Italian", "Thai", "Mexican", "Indian"], answerIndex: 0 },
];
