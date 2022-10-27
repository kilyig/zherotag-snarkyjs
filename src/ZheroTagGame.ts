import {
  Field,
  CircuitValue,
  prop,
  PublicKey,
  Circuit,
  PrivateKey,
} from 'snarkyjs';

import { PiecePosition } from './PiecePosition.js';
import { ZheroTagBoard } from './ZheroTagBoard.js';

export class ZheroTagGame extends CircuitValue {
  @prop ID: Field;
  playerAddresses: [PublicKey, PublicKey];
  board: ZheroTagBoard;
  @prop turn: Field;

  static fromField(
    ID: Field,
    playerAddresses: [PublicKey, PublicKey],
    board: ZheroTagBoard,
    turn: Field
  ) {
    return new ZheroTagGame(ID, playerAddresses, board, turn);
  }

  findSides(playerPublicKey: PublicKey) {
    let me = Circuit.if(this.playerAddresses[0].equals(playerPublicKey), 0, 1);
    let you = Circuit.if(this.playerAddresses[0].equals(playerPublicKey), 1, 0);

    return [me, you];
  }

  findPlayerNumber(playerPublicKey: PublicKey) {
    let me = Circuit.if(this.playerAddresses[0].equals(playerPublicKey), 0, 1);
    return me;
  }

  isPlaying(playerAddress: PublicKey) {
    return playerAddress
      .equals(this.playerAddresses[0])
      .or(playerAddress.equals(this.playerAddresses[1]));
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

  play(
    callerPrivateKey: PrivateKey,
    oldPos: PiecePosition,
    oldPosSalt: Field,
    newPos: PiecePosition,
    newPosSalt: Field
  ) {
    // check that the caller is actually a player in this game
    this.isPlaying(callerPrivateKey.toPublicKey()).assertTrue();

    let player = this.findPlayerNumber(callerPrivateKey.toPublicKey());

    // it should be the caller's turn
    Field.fromNumber(player).assertEquals(this.turn);

    // check that oldPos is actually the previous position
    oldPos.hash(oldPosSalt).assertEquals(this.board.players[player].posHash);

    // the new position should be a Moore neighbor of the old position.
    this.isValidMove(oldPos, newPos).assertTrue();

    // update the game state
    // TODO: do the rest
    this.turn = this.turn.add(Field(1));
    this.board.players[player].posHash = newPos.hash(newPosSalt);
    // let newPosHash = Poseidon.hash([newPos.x, newPos.y, newPosSalt]);
    // let newTurnstep = Field(1);
    // game.board.players[player].posHash = newPosHash;
    // let newGameState = ZheroTagGame.fromField(
    //   game.ID,
    //   game.players,
    //   game.turn,
    //   newTurnstep
    // );
  }
}
