// Small drawing primitives shared by scene entities. Every size is in world
// units and `S` converts world units to screen pixels.

import { View } from 'react-native';

/** Upward-pointing triangle built from borders. */
export function Triangle({ S, width, height, color }) {
  return (
    <View
      style={{
        width: 0,
        height: 0,
        borderLeftWidth: S(width / 2),
        borderRightWidth: S(width / 2),
        borderBottomWidth: S(height),
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderBottomColor: color,
      }}
    />
  );
}

/** A soft halo with a solid core centered inside it. */
export function GlowOrb({ S, x, y, size, coreSize, glowColor, coreColor, coreStyle }) {
  return (
    <View
      style={{
        position: 'absolute',
        left: S(x),
        top: S(y),
        width: S(size),
        height: S(size),
        borderRadius: S(size / 2),
        backgroundColor: glowColor,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <View
        style={[
          { width: S(coreSize), height: S(coreSize), borderRadius: S(coreSize / 2), backgroundColor: coreColor },
          coreStyle,
        ]}
      />
    </View>
  );
}
