import { Field, CircuitValue, prop } from 'snarkyjs';

export class PiecePosition extends CircuitValue {
  @prop x: Field;
  @prop y: Field;

  static fromField(x: Field, y: Field) {
    return new PiecePosition(x, y);
  }
}
