import { Book } from "../types";

export const BOOK: Book = {
  title: "Lily's Melodies Reach the Sky",
  pages: [
    {
      content:
        "Little Lily at four, sat by the keys, her fingers dancing with gentle ease. Popcorn barked, a playful cheer, as music blossomed far and near. Morning light shone soft and bright, in a cozy room filled with delight.",
      synopsis:
        "A cozy bright morning in a home filled with sunlight. Lily, a 4-year-old girl with light-brown messy hair wears a Hello Kitty-inspired outfit, sitting at a small piano. Next to her, Popcorn, the white Miniature Schnauzer puppy, happily barks and watches her play. The atmosphere is warm and cheerful.",
    },
    {
      content:
        "With tiny hands, she practiced each song, some notes were right, some notes were wrong. But Popcorn stayed close, never far, a furry friend, her little star.",
      synopsis:
        "Inside the same warm room, Lily practices piano notes. Her face shows determination and slight frustration as she gets some notes wrong, but Popcorn stays close, sitting by her side, wagging her tail encouragingly.",
    },
    {
      content:
        "Days turned to months, the scales grew strong, Lily’s fingers danced all day long. Mom watched quietly from the hall, proud of her girl who’d give her all.",
      synopsis:
        "Afternoon, sun filters through the window as Lily plays with growing confidence and skill. Her mother quietly stands in the hallway observing with a glowing smile. Popcorn naps nearby, feeling calm and happy.",
    },
    {
      content:
        "At five, she played songs fast and slow, melodies that made hearts warmly glow. Popcorn barked in joyful tune, under the soft light of the moon.",
      synopsis:
        "Evening scene with soft moonlight streaming in. Lily skillfully plays complex melodies on the piano, her face joyful and focused. Popcorn sits near the piano, barking happily to the music as if joining in celebration.",
    },
    {
      content:
        "Years of practice, hard work, and care, soon made Lily a player rare. On grand stages, she’d shine so bright, her music soaring through the night.",
      synopsis:
        "A larger stage with bright lights and an audience. An older Lily confidently plays the grand piano. Popcorn sits watching, a proud companion. The mother watches from backstage, beaming with pride.",
    },
    {
      content:
        "Now a world-class pianist, Lily beams, her journey filled with hopes and dreams. Popcorn barks, her faithful friend, proud of a bond that will never end.",
      synopsis:
        "A grand concert hall filled with applause. Lily takes a bow smiling radiantly. Popcorn barks joyfully on the floor by her side. The mother stands behind, eyes glistening with tears of joy. The scene is full of warmth and achievement.",
    },
  ],
  randomFact:
    "Puppies like Popcorn can sense their owner’s emotions and often offer comfort when they practice or perform.",
};

export const PIANO: Book = {
  title: BOOK.title,
  pages: BOOK.pages,
  randomFact: BOOK.randomFact,
};
