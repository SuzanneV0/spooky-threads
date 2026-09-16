export type TropeSlug =
  | "magical-witches"
  | "spooky-ghosts"
  | "bats-and-cats"
  | "cute-pumpkins"
  | "monsters-galore";

export type Trope = {
  slug: TropeSlug;
  name: string;
  emoji: string;
  description: string;
};

export const tropes: Record<TropeSlug, Trope> = {
  "magical-witches": {
    slug: "magical-witches",
    name: "The Witch",
    emoji: "🔮",
    description:
      "You're the brains of every gathering, always got a trick up your sleeve (and maybe a potion, too). People come to you when they need something figured out.",
  },
  "spooky-ghosts": {
    slug: "spooky-ghosts",
    name: "The Ghost",
    emoji: "👻",
    description:
      "Mysterious, a little dramatic, and impossible to pin down. You haunt every room you walk into — in the best way.",
  },
  "bats-and-cats": {
    slug: "bats-and-cats",
    name: "The Black Cat",
    emoji: "🐈‍⬛",
    description:
      "Independent, a little mischievous, and probably the reason something went missing. You do things on your own schedule.",
  },
  "cute-pumpkins": {
    slug: "cute-pumpkins",
    name: "The Jack-o'-Lantern",
    emoji: "🎃",
    description:
      "Warm, glowing, and welcoming — everyone wants you on their porch. You're the reason the party feels cozy.",
  },
  "monsters-galore": {
    slug: "monsters-galore",
    name: "The Monster",
    emoji: "🧟",
    description:
      "Big energy, big heart, not actually scary once people get to know you. You show up loud and leave a lasting impression.",
  },
};

export type QuizQuestion = {
  question: string;
  options: { label: string; trope: TropeSlug }[];
};

export const quizQuestions: QuizQuestion[] = [
  {
    question: "It's Halloween night. Where are you?",
    options: [
      { label: "Casting spells at a candlelit gathering", trope: "magical-witches" },
      { label: "Drifting through the party, unnoticed until the perfect moment", trope: "spooky-ghosts" },
      { label: "Prowling the neighborhood rooftops", trope: "bats-and-cats" },
      { label: "On the porch, glowing and greeting trick-or-treaters", trope: "cute-pumpkins" },
      { label: "In the middle of the dance floor, being the loudest one there", trope: "monsters-galore" },
    ],
  },
  {
    question: "Pick a Halloween snack.",
    options: [
      { label: "Something bubbling in a cauldron", trope: "magical-witches" },
      { label: "Whatever's left after everyone else has eaten", trope: "spooky-ghosts" },
      { label: "Whatever you can steal off someone else's plate", trope: "bats-and-cats" },
      { label: "Warm spiced cider and a slice of pie", trope: "cute-pumpkins" },
      { label: "All of it. Every snack. At once.", trope: "monsters-galore" },
    ],
  },
  {
    question: "Your friends would describe you as...",
    options: [
      { label: "Wise, and a little mysterious", trope: "magical-witches" },
      { label: "Dramatic and hard to pin down", trope: "spooky-ghosts" },
      { label: "Independent and a bit sneaky", trope: "bats-and-cats" },
      { label: "Warm, welcoming, always glowing", trope: "cute-pumpkins" },
      { label: "Loud, lovable, larger than life", trope: "monsters-galore" },
    ],
  },
  {
    question: "Pick your go-to costume accessory.",
    options: [
      { label: "A pointy hat and a broomstick", trope: "magical-witches" },
      { label: "A sheet with perfectly cut eye holes", trope: "spooky-ghosts" },
      { label: "Fake whiskers and a tail", trope: "bats-and-cats" },
      { label: "Orange face paint and a little green stem", trope: "cute-pumpkins" },
      { label: "Green face paint and a couple of bolts", trope: "monsters-galore" },
    ],
  },
  {
    question: "How do you like to scare people?",
    options: [
      { label: "A curse they won't see coming", trope: "magical-witches" },
      { label: "A slow creak, then silence... then BOO", trope: "spooky-ghosts" },
      { label: "A silent walk-by that makes them jump", trope: "bats-and-cats" },
      { label: "You don't scare anyone — you're just happy to see them", trope: "cute-pumpkins" },
      { label: "A full-volume roar around the corner", trope: "monsters-galore" },
    ],
  },
];

export function tallyResult(answers: TropeSlug[]): TropeSlug {
  const counts: Record<string, number> = {};
  for (const answer of answers) {
    counts[answer] = (counts[answer] ?? 0) + 1;
  }
  let winner: TropeSlug = answers[0];
  let best = 0;
  for (const answer of answers) {
    if (counts[answer] > best) {
      best = counts[answer];
      winner = answer;
    }
  }
  return winner;
}
