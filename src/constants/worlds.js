// Per-world data: name, color theme, boss arena and boss configuration.
//
// Boss attacks (all optional):
//   charge   { every, windup, speed }  telegraphed dash; dizzy after hitting a wall
//   slam     true                      landing sends shockwaves along the ground
//   jumpAim  true                      jumps leap toward the player
//   shot     'aim' | 'spread' | 'rain' | 'burst', or a list used in turn
//   minions  { kind: 'beetle' | 'moth', every, max }
//   phase2   overrides merged in when the boss drops to half health

export const WORLDS = [
  {
    name: 'Night Garden',
    arena: 'garden',
    theme: { sky: '#2B2350', hillFar: '#3A2F66', hillNear: '#4B3C7C', moss: '#6FA35A' },
    boss: {
      name: 'Beetle Baron', type: 'ground', color: '#E4572E', dark: '#9E3A1E',
      w: 84, h: 60, hp: 4, speed: 80,
      charge: { every: 3.4, windup: 0.8, speed: 360 },
      phase2: {
        speed: 100,
        charge: { every: 2.6, windup: 0.6, speed: 420 },
        minions: { kind: 'beetle', every: 4.5, max: 3 },
      },
    },
  },
  {
    name: 'Misty Marsh',
    arena: 'marsh',
    theme: { sky: '#1E3946', hillFar: '#28495A', hillNear: '#335D6E', moss: '#8DBF6A' },
    boss: {
      name: 'Bog Toad', type: 'ground', color: '#5E9E6B', dark: '#34603E',
      w: 90, h: 64, hp: 5, speed: 60, jumpEvery: 2.0, jumpPower: 760, slam: true,
      phase2: { jumpEvery: 1.5, jumpAim: true, shootEvery: 2.4, shot: 'spread', shotSpeed: 220 },
    },
  },
  {
    name: 'Moonlit Ridge',
    arena: 'ridge',
    theme: { sky: '#3A1F3D', hillFar: '#4F294D', hillNear: '#65345F', moss: '#C9A94A' },
    boss: {
      name: 'Moth Queen', type: 'fly', color: '#B79CEB', dark: '#6D52A8',
      w: 92, h: 50, hp: 6, speed: 90, hoverY: 90, swoopEvery: 3.2,
      shootEvery: 2.4, shot: 'rain',
      phase2: {
        swoopEvery: 2.4, slam: true, shootEvery: 2.0, shot: ['rain', 'burst'],
        minions: { kind: 'moth', every: 5, max: 2 },
      },
    },
  },
  {
    name: 'Ember Hollow',
    arena: 'hollow',
    theme: { sky: '#3B1E1A', hillFar: '#522A22', hillNear: '#6A352A', moss: '#E08A3C' },
    boss: {
      name: 'Ember King', type: 'ground', color: '#D94A2B', dark: '#7A2616',
      w: 96, h: 70, hp: 7, speed: 95, jumpEvery: 3.0, jumpPower: 700, slam: true,
      shootEvery: 1.8, shot: 'aim', shotSpeed: 240,
      phase2: {
        speed: 115, shootEvery: 1.5, shot: ['spread', 'rain'],
        charge: { every: 4, windup: 0.7, speed: 400 },
      },
    },
  },
];
