// The story told between worlds: an intro before each world's first level and
// an outro after its boss falls. Each page names the art drawn behind it.

/**
 * @typedef {object} StoryPage
 * @property {string} text
 * @property {'lanternDark' | 'lanternLit' | 'hero' | 'boss' | 'seeds'} art
 */

/** @type {{ intro: StoryPage[], outro: StoryPage[] }[]} one entry per world */
export const STORIES = [
  {
    intro: [
      { art: 'lanternLit', text: 'For as long as anyone remembers, the Great Lantern on Hollow Hill has kept the valley safe through the night.' },
      { art: 'lanternDark', text: 'Tonight it went dark. Its light burst into a thousand glowing seeds and scattered across the land.' },
      { art: 'hero', text: 'You are the Lantern Keeper. Take your little lantern, gather the seeds, and bring the light home.' },
      { art: 'boss', text: 'But something in the Night Garden has been gobbling up seeds. Something with a very hard shell.' },
    ],
    outro: [
      { art: 'seeds', text: 'The Beetle Baron scuttles off, and a pile of stolen seeds spills out of his burrow.' },
      { art: 'hero', text: 'Some seeds are missing, and their trail leads away from the garden, into the fog.' },
    ],
  },
  {
    intro: [
      { art: 'hero', text: 'Mist rolls in over the Misty Marsh. Your lantern can barely push the fog aside.' },
      { art: 'boss', text: 'Deep in the bog something huge is croaking, and every croak shakes the ground.' },
    ],
    outro: [
      { art: 'seeds', text: 'The Bog Toad coughs up a seed that glows red and feels as warm as a coal.' },
      { art: 'hero', text: 'Someone is burning the light. The moths on the ridge above must have seen who.' },
    ],
  },
  {
    intro: [
      { art: 'hero', text: 'Moonlit Ridge glitters with stolen light, and moths swarm around every glow.' },
      { art: 'boss', text: 'Their queen wants all the light for herself, and she does not share.' },
    ],
    outro: [
      { art: 'boss', text: '"The Ember King," the queen whispers as she flees. "He swallows the seeds to become a new sun."' },
      { art: 'hero', text: 'Below the ridge, the ground glows orange. The road leads down into Ember Hollow.' },
    ],
  },
  {
    intro: [
      { art: 'hero', text: 'Heat pours out of cracks in the ground, and embers drift up like angry fireflies.' },
      { art: 'boss', text: 'At the bottom of the hollow waits the Ember King, blazing with every seed he has stolen.' },
      { art: 'lanternDark', text: 'This is the last of the light. Bring it home, Lantern Keeper.' },
    ],
    outro: [
      { art: 'seeds', text: 'The Ember King sputters and goes out, and a flood of seeds pours free.' },
      { art: 'lanternLit', text: 'You carry them up Hollow Hill, and the Great Lantern blazes brighter than ever.' },
      { art: 'hero', text: 'The valley sleeps safe tonight, all thanks to one small lantern. The end.' },
    ],
  },
];

export const storyId = (world, kind) => `${world}-${kind}`;
