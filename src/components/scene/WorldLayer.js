import { View } from 'react-native';

import { isOnScreen } from '../../game/engine/camera';
import { Boss } from './entities/Boss';
import { Bat, Beetle, Ember, Hopper, Moth, Shot, Spitter } from './entities/Enemies';
import { ThornWheel, Vent } from './entities/Obstacles';
import { Checkpoint, GoalFlag, Seed } from './entities/Pickups';
import { Player } from './entities/Player';
import { Solid, Spikes } from './entities/Terrain';

/** A wheel's whole swing, so its chain doesn't pop out at the screen edge. */
const wheelBounds = (w) => ({ x: w.cx - w.radius - w.w, w: (w.radius + w.w) * 2 });

/** Everything that scrolls with the camera, culled to what's on screen. */
export function WorldLayer({ S, level, player, camX, viewWidth }) {
  const visible = (obj) => isOnScreen(obj, camX, viewWidth);
  const alive = (e) => !e.dead && visible(e);
  const { boss, goal } = level;

  return (
    <View style={{ position: 'absolute', left: 0, top: 0, transform: [{ translateX: -S(camX) }] }}>
      {level.vents.map((v, i) => visible(v) && <Vent key={`vent${i}`} S={S} vent={v} />)}
      {level.solids.map((s, i) => visible(s) && (
        <Solid key={`solid${i}`} S={S} solid={s} mossColor={level.theme.moss} />
      ))}
      {level.spikes.map((s, i) => visible(s) && <Spikes key={`spikes${i}`} S={S} spikes={s} />)}
      {level.checkpoints.map((c, i) => visible(c) && <Checkpoint key={`cp${i}`} S={S} checkpoint={c} />)}
      {goal && visible(goal) && <GoalFlag S={S} goal={goal} />}
      {level.seeds.map((s, i) => !s.taken && visible(s) && <Seed key={`seed${i}`} S={S} seed={s} />)}
      {level.spitters.map((e, i) => alive(e) && <Spitter key={`spitter${i}`} S={S} spitter={e} />)}
      {level.beetles.map((e, i) => alive(e) && <Beetle key={`beetle${i}`} S={S} beetle={e} />)}
      {level.hoppers.map((e, i) => alive(e) && <Hopper key={`hopper${i}`} S={S} hopper={e} />)}
      {level.bats.map((e, i) => alive(e) && <Bat key={`bat${i}`} S={S} bat={e} />)}
      {level.flyers.map((f, i) => {
        if (!alive(f)) return null;
        return f.kind === 'moth'
          ? <Moth key={`flyer${i}`} S={S} moth={f} />
          : <Ember key={`flyer${i}`} S={S} ember={f} />;
      })}
      {level.wheels.map((w, i) => visible(wheelBounds(w)) && <ThornWheel key={`wheel${i}`} S={S} wheel={w} />)}
      {boss && !boss.dead && <Boss S={S} boss={boss} />}
      {level.shots.map((s, i) => <Shot key={`shot${i}`} S={S} shot={s} />)}
      <Player S={S} player={player} />
    </View>
  );
}
