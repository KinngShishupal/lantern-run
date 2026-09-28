import { View } from 'react-native';

import { COLORS, GROUND_Y } from '../../constants';

const STAR_FIELD_WIDTH = 1000;
const STARS = Array.from({ length: 28 }, (_, i) => ({
  x: (i * 97) % STAR_FIELD_WIDTH,
  y: (i * 53) % 180,
  size: 2 + (i % 3),
}));

/** Fixed stars, spread across the screen width. */
function Stars({ S, screenWidth }) {
  return STARS.map((star, i) => (
    <View
      key={i}
      style={{
        position: 'absolute',
        left: (star.x / STAR_FIELD_WIDTH) * screenWidth,
        top: S(star.y),
        width: star.size,
        height: star.size,
        borderRadius: star.size,
        backgroundColor: COLORS.paper,
        opacity: 0.6,
      }}
    />
  ));
}

/** A row of hills scrolling at `parallax` times the camera speed. */
function HillLayer({ S, hills, camX, parallax, rise, color }) {
  return (
    <View style={{ position: 'absolute', left: 0, top: 0, transform: [{ translateX: -S(camX * parallax) }] }}>
      {hills.map((h, i) => (
        <View
          key={i}
          style={{
            position: 'absolute',
            left: S(h.x - h.r),
            top: S(GROUND_Y - h.r * rise),
            width: S(h.r * 2),
            height: S(h.r * 2),
            borderRadius: S(h.r),
            backgroundColor: color,
          }}
        />
      ))}
    </View>
  );
}

export function Background({ S, level, camX, screenWidth }) {
  const { theme } = level;
  return (
    <>
      <Stars S={S} screenWidth={screenWidth} />
      <HillLayer S={S} hills={level.hillsFar} camX={camX} parallax={0.25} rise={0.55} color={theme.hillFar} />
      <HillLayer S={S} hills={level.hillsNear} camX={camX} parallax={0.5} rise={0.4} color={theme.hillNear} />
    </>
  );
}
