import {
  Field,
  CircuitValue,
  prop,
  PublicKey,
  Circuit,
  PrivateKey,
  Signature,
} from 'snarkyjs';

import { PiecePosition } from './PiecePosition.js';
import { ZheroTagBoard } from './ZheroTagBoard.js';

export class ZheroTagGame extends CircuitValue {
  @prop ID: Field;
  @prop turn: Field;
  board: ZheroTagBoard;
  playerAddresses: [PublicKey, PublicKey];

  static fromField(
    ID: Field,
    turn: Field,
    board: ZheroTagBoard,
    players: [PublicKey, PublicKey]
  ) {
    return new ZheroTagGame(ID, turn, board, players);
  }

  findSides(game: ZheroTagGame, playerPublicKey: PublicKey) {
    let me = Circuit.if(game.playerAddresses[0].equals(playerPublicKey), 0, 1);
    let you = Circuit.if(game.playerAddresses[0].equals(playerPublicKey), 1, 0);

    return [me, you];
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
    game: ZheroTagGame,
    gameSignature: Signature,
    oldPos: PiecePosition,
    oldPosSalt: Field,
    newPos: PiecePosition,
    newPosSalt: Field
  ): [ZheroTagGame, Signature] {
    // check that the caller is actually a player in this game
    game.isPlaying(callerPrivateKey.toPublicKey()).assertTrue();

    let [player, opponent] = this.findSides(
      game,
      callerPrivateKey.toPublicKey()
    );

    // check the signature
    gameSignature.verify(game.playerAddresses[opponent], game.toFields());

    // it should be the caller's turn
    Field.fromNumber(player).assertEquals(game.turn);

    // check that oldPos is actually the previous position
    oldPos.hash(oldPosSalt).assertEquals(game.board.players[player].posHash);

    // the new position should be a Moore neighbor of the old position.
    game.isValidMove(oldPos, newPos).assertTrue();

    // update the game state
    // TODO: do the rest
    game.turn = game.turn.add(Field(1));
    game.board.players[player].posHash = newPos.hash(newPosSalt);
    // let newPosHash = Poseidon.hash([newPos.x, newPos.y, newPosSalt]);
    // let newTurnstep = Field(1);
    // game.board.players[player].posHash = newPosHash;
    // let newGameState = ZheroTagGame.fromField(
    //   game.ID,
    //   game.players,
    //   game.turn,
    //   newTurnstep
    // );

    // the new game state should be signed by the caller of this function
    let newSig = Signature.create(callerPrivateKey, game.toFields());

    return [game, newSig];
  }
}
