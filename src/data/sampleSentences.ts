export interface SampleSentence {
  id: number;
  emoji: string;
  label: string;
  text: string;
}

export const sampleSentences: SampleSentence[] = [
  {
    id: 1,
    emoji: "🌞",
    label: "Good Morning",
    text: "Good morning! How are you today? I hope you have a wonderful day!",
  },
  {
    id: 2,
    emoji: "🐶",
    label: "My Pet",
    text: "I have a cute dog. His name is Max. He likes to play and run in the park.",
  },
  {
    id: 3,
    emoji: "🍎",
    label: "Fruits",
    text: "Apples are red. Bananas are yellow. Oranges are orange. I love eating fruit!",
  },
  {
    id: 4,
    emoji: "🏫",
    label: "School",
    text: "I go to school every day. My favorite subject is English. I love learning new words!",
  },
  {
    id: 5,
    emoji: "🌈",
    label: "Colors",
    text: "The rainbow has many colors: red, orange, yellow, green, blue, and purple.",
  },
  {
    id: 6,
    emoji: "🚀",
    label: "Space",
    text: "The sun is a big star. The moon goes around the Earth. There are eight planets in our solar system.",
  },
];
