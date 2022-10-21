import { Field, CircuitValue, prop, Poseidon } from 'snarkyjs';

export class PiecePosition extends CircuitValue {
  @prop x: Field;
  @prop y: Field;

  static fromField(x: Field, y: Field) {
    return new PiecePosition(x, y);
  }

  hash(salt: Field) {
    return Poseidon.hash([this.x, this.y, salt]);
  }
}
