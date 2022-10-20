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
    newPosSalt: Field
    /*alpha: Field,*/
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
    Poseidon.hash([oldPos.x, oldPos.y, oldPosSalt]).assertEquals(
      game.players[player].posHash
    );

    // the new position should be a Moore neighbor of the old position.
    oldPos.x.sub(newPos.x).assertLte(1);
    newPos.x.sub(oldPos.x).assertLte(1);
    oldPos.y.sub(newPos.y).assertLte(1);
    newPos.y.sub(oldPos.y).assertLte(1);

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

    return newSig;
  }
}
