// Per-world data: name, color theme and boss configuration.

export const WORLDS = [
  {
    name: 'Night Garden',
    theme: { sky: '#2B2350', hillFar: '#3A2F66', hillNear: '#4B3C7C', moss: '#6FA35A' },
    boss: {
      name: 'Beetle Baron', type: 'ground', color: '#E4572E', dark: '#9E3A1E',
      w: 84, h: 60, hp: 3, speed: 80,
    },
  },
  {
    name: 'Misty Marsh',
    theme: { sky: '#1E3946', hillFar: '#28495A', hillNear: '#335D6E', moss: '#8DBF6A' },
    boss: {
      name: 'Bog Toad', type: 'ground', color: '#5E9E6B', dark: '#34603E',
      w: 90, h: 64, hp: 4, speed: 60, jumpEvery: 2.0, jumpPower: 760,
    },
  },
  {
    name: 'Moonlit Ridge',
    theme: { sky: '#3A1F3D', hillFar: '#4F294D', hillNear: '#65345F', moss: '#C9A94A' },
    boss: {
      name: 'Moth Queen', type: 'fly', color: '#B79CEB', dark: '#6D52A8',
      w: 92, h: 50, hp: 5, speed: 90, hoverY: 90, swoopEvery: 3.2,
      shootEvery: 2.4, shot: 'rain',
    },
  },
  {
    name: 'Ember Hollow',
    theme: { sky: '#3B1E1A', hillFar: '#522A22', hillNear: '#6A352A', moss: '#E08A3C' },
    boss: {
      name: 'Ember King', type: 'ground', color: '#D94A2B', dark: '#7A2616',
      w: 96, h: 70, hp: 6, speed: 95, jumpEvery: 3.0, jumpPower: 700,
      shootEvery: 1.8, shot: 'aim', shotSpeed: 240,
    },
  },
];
