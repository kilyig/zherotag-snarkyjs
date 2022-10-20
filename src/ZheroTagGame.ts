import { Field, CircuitValue, prop } from 'snarkyjs';

import { ZheroTagPlayer } from './ZheroTagPlayer.js';

export class ZheroTagGame extends CircuitValue {
  @prop ID: Field;
  players: ZheroTagPlayer[];
  @prop turn: Field;
  @prop turnstep: Field;

  static fromField(
    ID: Field,
    players: ZheroTagPlayer[],
    turn: Field,
    turnstep: Field
  ) {
    return new ZheroTagGame(ID, players, turn, turnstep);
  }
}
