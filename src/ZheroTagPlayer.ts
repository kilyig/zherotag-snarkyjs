import { Field, CircuitValue, prop } from 'snarkyjs';

export class ZheroTagPlayer extends CircuitValue {
  @prop posHash: Field;

  static fromField(posHash: Field) {
    return new ZheroTagPlayer(posHash);
  }
}
