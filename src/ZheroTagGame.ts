import { Field, CircuitValue, prop } from 'snarkyjs';

import { ZheroTagPlayer } from './ZheroTagPlayer.js';
import { PiecePosition } from './PiecePosition.js';

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

  isValidMove(initial: PiecePosition, final: PiecePosition) {
    return (
      initial.x.sub(final.x).lte(1) &&
      final.x.sub(initial.x).lte(1) &&
      initial.y.sub(final.y).lte(1) &&
      final.y.sub(initial.y).lte(1)
    );
  }

  visibleSquares(pos: PiecePosition) {
    return [
      PiecePosition.fromField(pos.x.sub(Field(1)), pos.y.sub(Field(1))),
      PiecePosition.fromField(pos.x.sub(Field(1)), pos.y),
      PiecePosition.fromField(pos.x.sub(Field(1)), pos.y.add(Field(1))),
      PiecePosition.fromField(pos.x, pos.y.sub(Field(1))),
      PiecePosition.fromField(pos.x, pos.y),
      PiecePosition.fromField(pos.x, pos.y.add(Field(1))),
      PiecePosition.fromField(pos.x.add(Field(1)), pos.y.sub(Field(1))),
      PiecePosition.fromField(pos.x.add(Field(1)), pos.y),
      PiecePosition.fromField(pos.x.add(Field(1)), pos.y.add(Field(1))),
    ];
  }
}
