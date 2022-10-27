import { Field, CircuitValue, prop } from 'snarkyjs';

import { ZheroTagPlayer } from './ZheroTagPlayer.js';

export class ZheroTagBoard extends CircuitValue {
  @prop x: Field;
  @prop y: Field;
  players: [ZheroTagPlayer, ZheroTagPlayer];

  static fromField(
    x: Field,
    y: Field,
    players: [ZheroTagPlayer, ZheroTagPlayer]
  ) {
    return new ZheroTagBoard(x, y, players);
  }
}
