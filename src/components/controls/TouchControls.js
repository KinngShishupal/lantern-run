import { StyleSheet, Text, View } from 'react-native';

import { COLORS, CONTROLS_HEIGHT, TOUCH_ZONES } from '../../constants';

/**
 * Multi-touch pad strip. The whole strip is the touch surface: the left
 * zones steer and the right side jumps, so fingers don't need to hit the
 * drawn pads exactly.
 */
export function TouchControls({ screenWidth, onInputChange }) {
  const handleTouches = (e) => {
    const controls = { left: false, right: false, jump: false };
    for (const touch of e.nativeEvent.touches || []) {
      const fx = touch.pageX / screenWidth;
      if (fx < TOUCH_ZONES.leftEnd) controls.left = true;
      else if (fx < TOUCH_ZONES.rightEnd) controls.right = true;
      else if (fx > TOUCH_ZONES.jumpStart) controls.jump = true;
    }
    onInputChange(controls);
  };

  return (
    <View
      style={styles.controls}
      onTouchStart={handleTouches}
      onTouchMove={handleTouches}
      onTouchEnd={handleTouches}
      onTouchCancel={handleTouches}
    >
      <View pointerEvents="none" style={styles.padRow}>
        <View style={[styles.pad, { left: screenWidth * 0.04 }]}>
          <Text style={styles.padText}>◀</Text>
        </View>
        <View style={[styles.pad, { left: screenWidth * 0.25 }]}>
          <Text style={styles.padText}>▶</Text>
        </View>
        <View style={[styles.pad, styles.jumpPad, { right: screenWidth * 0.06 }]}>
          <Text style={[styles.padText, styles.jumpText]}>Jump</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  controls: { width: '100%', height: CONTROLS_HEIGHT, backgroundColor: COLORS.ink },
  padRow: { flex: 1 },
  pad: {
    position: 'absolute',
    top: 26,
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: COLORS.skyLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  jumpPad: { width: 110, height: 84, backgroundColor: COLORS.glow },
  padText: { color: COLORS.paper, fontSize: 24, fontWeight: '900' },
  jumpText: { color: COLORS.ink },
});
