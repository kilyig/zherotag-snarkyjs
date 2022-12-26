import { Field, CircuitValue, prop } from 'snarkyjs';
import { PiecePosition } from './PiecePosition.js';

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

  verifyPos(playernum: number, pos: PiecePosition, posSalt: Field) {
    pos.hash(posSalt).assertEquals(this.players[playernum].getHash());
  }
}
