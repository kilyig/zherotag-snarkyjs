import { Field, CircuitValue, PublicKey, prop } from 'snarkyjs';

export class ZheroTagPlayer extends CircuitValue {
  @prop address: PublicKey;
  @prop posHash: Field;

  static fromField(address: PublicKey, posHash: Field) {
    return new ZheroTagPlayer(address, posHash);
  }
}
