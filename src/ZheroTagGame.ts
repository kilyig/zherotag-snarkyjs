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
  @prop winner: Field;

  static fromField(
    ID: Field,
    playerAddresses: [PublicKey, PublicKey],
    board: ZheroTagBoard,
    turn: Field,
    winner: Field
  ) {
    return new ZheroTagGame(ID, playerAddresses, board, turn, winner);
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

  isPlayingNext(playerAddress: PublicKey) {
    // first check that the caller is actually a player in this game
    this.isPlaying(playerAddress).assertTrue();

    let player = this.findPlayerNumber(playerAddress);

    return Field.fromNumber(player).equals(this.turn);
  }

  visibleSquares(pos: PiecePosition) {
    return this.board.visibleSquares(pos);
  }

  verifyPos(playerAddress: PublicKey, pos: PiecePosition, posSalt: Field) {
    let player = this.findPlayerNumber(playerAddress);
    return this.board.verifyPos(player, pos, posSalt);
  }

  updateWinner() {}

  play(
    callerPrivateKey: PrivateKey,
    oldPos: PiecePosition,
    oldPosSalt: Field,
    newPos: PiecePosition,
    newPosSalt: Field
  ) {
    // it should be the caller's turn
    this.isPlayingNext(callerPrivateKey.toPublicKey()).assertTrue();

    let player = this.findPlayerNumber(callerPrivateKey.toPublicKey());

    // check that oldPos is actually the previous position
    oldPos.hash(oldPosSalt).assertEquals(this.board.players[player].posHash);

    // the new position should be a Moore neighbor of the old position.
    this.board.isValidMove(oldPos, newPos).assertTrue();

    // update the game state
    this.turn = this.turn.add(Field(1));
    this.board.players[player].posHash = newPos.hash(newPosSalt);

    // check if the game has finished
    this.updateWinner();
  }
}
