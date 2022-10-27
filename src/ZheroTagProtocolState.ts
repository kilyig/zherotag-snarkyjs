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
  @prop protocolStep: UInt32;
  game: ZheroTagGame;

  move(
    callerPrivateKey: PrivateKey,
    oldPos: PiecePosition,
    oldPosSalt: Field,
    newPos: PiecePosition,
    newPosSalt: Field,
    alpha: Field
  ) {
    // it must be someone's turn to make a move
    // so, the last protocol state should be step 2
    this.protocolStep.assertEquals(UInt32.fromNumber(2));

    // make the move and update the game state
    this.game.play(callerPrivateKey, oldPos, oldPosSalt, newPos, newPosSalt);

    // update the protocol turn
    this.protocolStep = UInt32.zero;

    // sign the current protocol state
    let signature: Signature = Signature.create(
      callerPrivateKey,
      this.toFields()
    );

    // prepare packet for board update protocol
    return [
      signature,
      prepareProtocolPacket(this.game.visibleSquares(newPos), alpha),
    ];
  }

  replyToMove /*callerPrivateKey: PrivateKey,
    game: ZheroTagGame,
    gameSignature: Signature,
    oldPos: PiecePosition,
    oldPosSalt: Field,
    newPos: PiecePosition,
    newPosSalt: Field,
    alpha: Field*/() {
    // set 1 (for protocol 1): apply your first secret value to the values in the set
    //                         that was created from the squares the opponent can see
    // set 2 (for protocol 1): apply your first secret value to your piece's position
    // set 3 (for protocol 2): apply your second secret value to the squares that you
    //                         can see
    // all sets are sent to the opponent
  }

  replyToReplyToMove /*callerPrivateKey: PrivateKey,
    game: ZheroTagGame,
    gameSignature: Signature,
    oldPos: PiecePosition,
    oldPosSalt: Field,
    newPos: PiecePosition,
    newPosSalt: Field,
    alpha: UInt64*/() {}
}
