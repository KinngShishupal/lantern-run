// Purely cosmetic effects: particles and screen flashes. Nothing here affects
// gameplay, so it uses Math.random freely.

import { GROUND_Y } from '../../constants';

const MAX_PARTICLES = 100;
/** How far past the camera's left edge ambient embers can spawn. */
const AMBIENT_SPAN = 1100;

/**
 * Throws `count` particles out from (x, y).
 * @param {object} o
 * @param {number} [o.angle]   center direction, radians (0 = right, -PI/2 = up)
 * @param {number} [o.spread]  total cone width, radians (default: all around)
 * @param {number} [o.gravity] world units/s², negative floats upward
 */
export function spawnParticles(g, {
  x, y, count, speed, colors, size = 5, life = 0.8, angle = 0, spread = Math.PI * 2, gravity = 0,
}) {
  const list = g.level.particles;
  for (let i = 0; i < count && list.length < MAX_PARTICLES; i++) {
    const a = angle + (Math.random() - 0.5) * spread;
    const v = speed * (0.4 + Math.random() * 0.6);
    const l = life * (0.6 + Math.random() * 0.4);
    list.push({
      x, y,
      vx: Math.cos(a) * v,
      vy: Math.sin(a) * v,
      life: l,
      maxLife: l,
      size: size * (0.6 + Math.random() * 0.6),
      color: colors[Math.floor(Math.random() * colors.length)],
      gravity,
    });
  }
}

/** A full-screen color flash that fades over `duration` seconds. */
export function flash(g, color, duration, strength = 0.6) {
  g.flash = { color, time: duration, duration, strength };
}

/** Embers drifting up from the ground, for arenas with an `ambient` config. */
function spawnAmbient(g, dt, colors) {
  if (Math.random() > dt * 10) return;
  spawnParticles(g, {
    x: g.camX + Math.random() * AMBIENT_SPAN,
    y: GROUND_Y - 2,
    count: 1,
    speed: 40,
    angle: -Math.PI / 2,
    spread: 0.8,
    life: 2.4,
    size: 4,
    gravity: -30,
    colors,
  });
}

export function updateEffects(g, dt) {
  const { level } = g;
  if (g.flash) {
    g.flash.time -= dt;
    if (g.flash.time <= 0) g.flash = null;
  }
  if (level.ambient) spawnAmbient(g, dt, level.ambient.colors);

  const list = level.particles;
  for (let i = list.length - 1; i >= 0; i--) {
    const q = list[i];
    q.life -= dt;
    if (q.life <= 0) {
      list.splice(i, 1);
      continue;
    }
    q.vy += q.gravity * dt;
    q.x += q.vx * dt;
    q.y += q.vy * dt;
  }
}
