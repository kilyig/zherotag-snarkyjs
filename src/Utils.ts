import { Circuit, Field } from 'snarkyjs';
import { PiecePosition } from './PiecePosition';

export function modexp(g: Field, x: number) {
  let result = Field(1);
  let base = g;

  while (x > 0) {
    result = Circuit.if(x % 2 === 1, result.mul(base), result);
    x = Math.floor(x / 2);
    base = base.square();
  }

  return result;
}

export function prepareProtocolPacket(squares: PiecePosition[], exp: number) {
  let packet: Field[] = [];
  squares.forEach(function (sqr) {
    // Field(1) is not necessary but the function requires it
    packet.push(modexp(sqr.hash(Field(1)), exp));
  });

  return packet;
}
