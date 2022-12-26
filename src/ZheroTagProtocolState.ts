import {
  Field,
  Signature,
  PrivateKey,
  CircuitValue,
  prop,
  UInt32,
  Group,
} from 'snarkyjs';

import { ZheroTagGame } from './ZheroTagGame.js';
import { PiecePosition } from './PiecePosition.js';
import {
  prepareProtocolPacket,
  reexponentiateProtocolPacket,
} from './Utils.js';

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
    this.protocolStep.assertEquals(new UInt32(Field(2)));

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

  replyToMove(
    callerPrivateKey: PrivateKey,
    pos: PiecePosition,
    posSalt: Field,
    beta: Field,
    alphaprime: Field,
    packetFromOpponent: Group[]
  ) {
    // the last step must have been someone moving their piece
    this.protocolStep.assertEquals(UInt32.zero);

    // caller must be a player in the game and it should be their turn
    this.game.isPlayingNext(callerPrivateKey.toPublicKey());

    // update the protocol turn
    this.protocolStep = UInt32.one;

    // sign the current protocol state
    let signature: Signature = Signature.create(
      callerPrivateKey,
      this.toFields()
    );

    // prepare the sets that need to be sent to the opponent
    // set 1 (for protocol 1): apply your first secret value to the values in the set
    //                         that was created from the squares the opponent can see
    // set 2 (for protocol 1): apply your first secret value to your piece's position
    // set 3 (for protocol 2): apply your second secret value to the squares that you
    //                         can see
    let set1 = reexponentiateProtocolPacket(packetFromOpponent, beta);
    this.game.verifyPos(callerPrivateKey.toPublicKey(), pos, posSalt);
    let set2 = prepareProtocolPacket([pos], beta);
    let set3 = prepareProtocolPacket(this.game.visibleSquares(pos), alphaprime);

    // all sets are sent to the opponent
    return [signature, [set1, set2, set3]];
  }

  replyToReplyToMove(
    callerPrivateKey: PrivateKey,
    newPos: PiecePosition,
    newPosSalt: Field,
    betaprime: Field,
    packetFromOpponent: Group[]
  ) {
    this.protocolStep.assertEquals(UInt32.one);

    // caller must be a player in the game but it shouldn't
    // be their turn. they just played.
    this.game.isPlaying(callerPrivateKey.toPublicKey());
    this.game.isPlayingNext(callerPrivateKey.toPublicKey()).assertFalse();

    this.protocolStep = new UInt32(Field(2));

    // sign the current protocol state
    let signature: Signature = Signature.create(
      callerPrivateKey,
      this.toFields()
    );

    // set 1 (for protocol 2): apply your second secret value to the values in the set
    //                         that was created from the squares the opponent can see
    // set 2 (for protocol 2): apply your second secret value to your piece's position
    let set1 = reexponentiateProtocolPacket(packetFromOpponent, betaprime);
    this.game.verifyPos(callerPrivateKey.toPublicKey(), newPos, newPosSalt);
    let set2 = prepareProtocolPacket([newPos], betaprime);

    // all sets are sent to the opponent
    return [signature, [set1, set2]];
  }
}
