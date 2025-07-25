import { Book, BookWImages } from "../types";

export const BOOK: Book = {
  title: "Rescue Hello Kit!",
  pages: [
    {
      content:
        "One stormy night, with thunder loud, Lily peered beyond the cloud. Popcorn barked and tugged her sleeve, “Hello Kit’s gone!” she couldn’t believe.",
      synopsis:
        "At night during a thunderstorm, Lily looks out the window while Popcorn barks urgently. They're inside Lily's cozy room, lit only by flashes of lightning. Popcorn has spotted something alarming outside, triggering their adventure.",
    },
    {
      content:
        "Hello Kit, their fluffy friend, was missing—gone! Did someone send? A trail of fur led to the gate, where creepy guards stayed up quite late.",
      synopsis:
        "In their backyard, Lily and Popcorn find tufts of Hello Kit’s white fur. The trail leads to a rusted metal gate guarded by eerie, sleepy sentries in the shadows of tall trees and moonlight.",
    },
    {
      content:
        "They tiptoed past the snoring guards, sneaking softly through the yards. Popcorn sniffed and wagged with might, leading Lily by moonlight.",
      synopsis:
        "Lily and Popcorn sneak quietly past sleeping guards in a garden filled with spooky statues and vines. The moon provides just enough light as Popcorn guides the way with his nose to the ground.",
    },
    {
      content:
        "Down a hill and through a crack, they found a cave that smelled like yak. Deep inside, a cage did swing, above hot lava—such a thing!",
      synopsis:
        "They enter a narrow rocky tunnel and emerge inside a glowing, echoing cave. In the center hangs a swinging iron cage above a bubbling pit of lava. The air is hot and glowing red.",
    },
    {
      content:
        "Inside that cage was Hello Kit, her red bow glowing just a bit. She meowed with fear and tiny paws, trapped and stuck by evil claws!",
      synopsis:
        "Hello Kit is shown trembling in a metal cage, suspended by chains. Her red bow flutters. Below her, lava gurgles menacingly. Glowing eyes of shadow creatures linger in the corners of the cavern.",
    },
    {
      content:
        "Lily gasped and held back tears, “We have to save her! Face our fears!” Popcorn barked, then made a dash, climbing rocks in one brave flash.",
      synopsis:
        "Lily, determined and teary-eyed, points to the cage. Popcorn leaps across a stone platform, ascending a pile of jagged rocks. The lava gives the cavern an orange-red glow, casting dramatic shadows.",
    },
    {
      content:
        "He leapt and climbed with all his might, biting through the chain just right. The cage came loose, it shook and swayed, but Lily’s plan was smartly laid.",
      synopsis:
        "Popcorn bites at the chain. As sparks fly, the cage begins to lower dangerously. Lily runs toward a lever on a ledge, preparing to execute her rescue plan before it's too late.",
    },
    {
      content:
        "She yanked a rope with all her power— it caught the cage in the final hour! The lava hissed and spat below, but Kit was safe—her bow aglow.",
      synopsis:
        "Lily pulls a rope tied to a pulley system just as the cage starts to fall. It swings away from the lava and lands safely on a stone platform. Popcorn barks with joy.",
    },
    {
      content:
        "They freed the latch, and out she sprang, Hello Kit with a thankful bang! She licked their cheeks and gave a purr, her soft white fur began to stir.",
      synopsis:
        "Hello Kit jumps into Lily’s arms. She purrs and rubs her face against Popcorn. The three of them embrace while lava glows in the background, casting a warm orange light.",
    },
    {
      content:
        "They raced back up with Kit in tow, past snoozing guards who didn’t know. Through secret paths, past every crack, Lily whispered, “We’ve got her back!”",
      synopsis:
        "The trio escapes through secret paths and back through the tunnels. The guards remain asleep as they quietly tiptoe past. The morning sky begins to lighten in the distance.",
    },
    {
      content:
        "At home again with warm, soft beds, they snuggled close their sleepy heads. Lily smiled with Popcorn near—Hello Kit was safe and clear!",
      synopsis:
        "In Lily’s bedroom, the sun is rising outside the window. Lily, Popcorn, and Hello Kit cuddle beneath a pink blanket. The red bow is still tied on Kit’s head, and all is calm.",
    },
    {
      content:
        "So when your friends are far from view, be brave and smart, like they were too! With hearts so big and courage bright, they turned the dark into the light.",
      synopsis:
        "A dreamy, poetic closing image. The three friends appear in the sky as stars smiling down. The tone is warm and magical, leaving readers with a comforting message about bravery and friendship.",
    },
  ],
  randomFact:
    "Lava can reach temperatures of up to 2,200°F (1,200°C)—hot enough to melt rock and metal!",
};

export const BOOK_W_IMAGES: BookWImages = {
  title: BOOK.title,
  pages: BOOK.pages.map((p, i) => ({
    ...p,
    image: {
      url: `/images/hello-kitty/${i + 1}.png`,
    },
  })),
  randomFact: BOOK.randomFact,
};
