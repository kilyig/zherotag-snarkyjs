import {
  Field,
  SmartContract,
  method,
  PublicKey,
  Signature,
  Poseidon,
  PrivateKey,
  Circuit,
  Bool,
} from 'snarkyjs';

import { ZheroTagGame } from './ZheroTagGame.js';
import { PiecePosition } from './PiecePosition.js';
import { prepareProtocolPacket } from './Utils.js';

export class ZheroTagMoves extends SmartContract {
  @method findSidesInGame(game: ZheroTagGame, playerPublicKey: PublicKey) {
    let me = Circuit.if(
      new Bool(game.players[0].address === playerPublicKey),
      0,
      1
    );
    let you = Circuit.if(
      new Bool(game.players[0].address === playerPublicKey),
      1,
      0
    );

    return [me, you];
  }

  @method move(
    callerPrivateKey: PrivateKey,
    game: ZheroTagGame,
    gameSignature: Signature,
    oldPos: PiecePosition,
    oldPosSalt: Field,
    newPos: PiecePosition,
    newPosSalt: Field,
    alpha: number
  ) {
    // TODO: check that the caller is actually a player in this game
    // so, player should not be undefined
    let [player, opponent] = this.findSidesInGame(
      game,
      callerPrivateKey.toPublicKey()
    );

    // check the signature
    gameSignature.verify(game.players[opponent].address, game.toFields());

    // it should be the caller's turn
    Field.fromNumber(player).assertEquals(game.turn);

    // board update process for the previous move should be finished
    game.turnstep.assertEquals(2);

    // check that oldPos is actually the previous position
    oldPos.hash(oldPosSalt).assertEquals(game.players[player].posHash);

    // the new position should be a Moore neighbor of the old position.
    game.isValidMove(oldPos, newPos).assertTrue();

    // update the game state
    let newPosHash = Poseidon.hash([newPos.x, newPos.y, newPosSalt]);
    let newTurnstep = Field(1);
    game.players[player].posHash = newPosHash;
    let newGameState = ZheroTagGame.fromField(
      game.ID,
      game.players,
      game.turn,
      newTurnstep
    );
    let newSig = Signature.create(callerPrivateKey, newGameState.toFields());

    // prepare packet for board update protocol
    return [
      newSig,
      prepareProtocolPacket(newGameState.visibleSquares(newPos), alpha),
    ];
  }
}
