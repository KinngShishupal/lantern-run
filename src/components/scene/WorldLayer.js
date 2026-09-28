import { View } from 'react-native';

import { isOnScreen } from '../../game/engine/camera';
import { Boss } from './entities/Boss';
import { Beetle, Ember, Moth, Shot } from './entities/Enemies';
import { Checkpoint, GoalFlag, Seed } from './entities/Pickups';
import { Player } from './entities/Player';
import { Solid, Spikes } from './entities/Terrain';

/** Everything that scrolls with the camera, culled to what's on screen. */
export function WorldLayer({ S, level, player, camX, viewWidth }) {
  const visible = (obj) => isOnScreen(obj, camX, viewWidth);
  const { boss, checkpoint, goal } = level;

  return (
    <View style={{ position: 'absolute', left: 0, top: 0, transform: [{ translateX: -S(camX) }] }}>
      {level.solids.map((s, i) => visible(s) && (
        <Solid key={`solid${i}`} S={S} solid={s} mossColor={level.theme.moss} />
      ))}
      {level.spikes.map((s, i) => visible(s) && <Spikes key={`spikes${i}`} S={S} spikes={s} />)}
      {checkpoint && visible(checkpoint) && <Checkpoint S={S} checkpoint={checkpoint} />}
      {goal && visible(goal) && <GoalFlag S={S} goal={goal} />}
      {level.seeds.map((s, i) => !s.taken && visible(s) && <Seed key={`seed${i}`} S={S} seed={s} />)}
      {level.beetles.map((e, i) => !e.dead && visible(e) && <Beetle key={`beetle${i}`} S={S} beetle={e} />)}
      {level.flyers.map((f, i) => {
        if (f.dead || !visible(f)) return null;
        return f.kind === 'moth'
          ? <Moth key={`flyer${i}`} S={S} moth={f} />
          : <Ember key={`flyer${i}`} S={S} ember={f} />;
      })}
      {boss && !boss.dead && <Boss S={S} boss={boss} />}
      {level.shots.map((s, i) => <Shot key={`shot${i}`} S={S} shot={s} />)}
      <Player S={S} player={player} />
    </View>
  );
}
