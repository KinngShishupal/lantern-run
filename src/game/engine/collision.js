/** Axis-aligned bounding-box overlap test for `{ x, y, w, h }` rects. */
export const overlaps = (a, b) =>
  a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

/** Shrinks a rect for a more forgiving hitbox. */
export const inset = (r, dx, dy = dx, bottom = dy) => ({
  x: r.x + dx,
  y: r.y + dy,
  w: r.w - dx * 2,
  h: r.h - dy - bottom,
});

/** True when `p` is falling onto the top `tolerance` units of `target`. */
export const isStomp = (p, target, tolerance) =>
  p.vy > 0 && p.y + p.h - target.y < tolerance;

/** Moves `obj[axis]` by `dir * speed * dt`, reversing at `[min, max - size]`. */
export function patrol(obj, axis, dt, size = 0) {
  obj[axis] += obj.dir * obj.speed * dt;
  if (obj[axis] < obj.min) {
    obj[axis] = obj.min;
    obj.dir = 1;
  }
  if (obj[axis] + size > obj.max) {
    obj[axis] = obj.max - size;
    obj.dir = -1;
  }
}
