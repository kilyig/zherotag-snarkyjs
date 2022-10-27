import {
  Field,
  Signature,
  PrivateKey,
  CircuitValue,
  prop,
  UInt32,
} from 'snarkyjs';

import { ZheroTagGame } from './ZheroTagGame.js';
import { PiecePosition } from './PiecePosition.js';
import { prepareProtocolPacket } from './Utils.js';

export class ZheroTagProtocolState extends CircuitValue {
  @prop signature: Signature;
  @prop protocolStep: UInt32;
  game: ZheroTagGame;

  move(
    callerPrivateKey: PrivateKey,
    game: ZheroTagGame,
    gameSignature: Signature,
    oldPos: PiecePosition,
    oldPosSalt: Field,
    newPos: PiecePosition,
    newPosSalt: Field,
    alpha: Field
  ) {
    // make the move and get the new game state
    let [newGame, newSig] = game.play(
      callerPrivateKey,
      game,
      gameSignature,
      oldPos,
      oldPosSalt,
      newPos,
      newPosSalt
    );

    // prepare packet for board update protocol
    return [
      newSig,
      prepareProtocolPacket(newGame.visibleSquares(newPos), alpha),
    ];
  }

  replyToMove() /*callerPrivateKey: PrivateKey,
    game: ZheroTagGame,
    gameSignature: Signature,
    oldPos: PiecePosition,
    oldPosSalt: Field,
    newPos: PiecePosition,
    newPosSalt: Field,
    alpha: Field*/
  {
    // set 1: apply your own secret value to the values in the set
    // that was created from the squares the opponent can see
    // set 2: apply your own secret to your piece's position
    // both sets are sent to the opponent
  }

  replyToReplyToMove() /*callerPrivateKey: PrivateKey,
    game: ZheroTagGame,
    gameSignature: Signature,
    oldPos: PiecePosition,
    oldPosSalt: Field,
    newPos: PiecePosition,
    newPosSalt: Field,
    alpha: UInt64*/
  {}
}
