import { Circuit, Field, Group, Scalar, UInt64 } from 'snarkyjs';
import { PiecePosition } from './PiecePosition';

// this is around 9-10x slower than Group.scale, so it won't be used in the protocol
export function modexp(g: Field, x: UInt64) {
  let result = Field(1);
  let base = g;

  for (let i = 0; i < 64; i++) {
    result = Circuit.if(
      x.mod(new UInt64(2)).equals(UInt64.one),
      result.mul(base),
      result
    );
    x = x.div(2);
    base = base.square();
  }

  return result;
}

export function prepareProtocolPacket(squares: PiecePosition[], exp: Field) {
  let packet: Group[] = [];
  squares.forEach(function (sqr) {
    // The `Field(1)` salt is not necessary but the function requires it
    // TODO: complete this function
    packet.push(
      new Group(sqr.hash(Field(1)), Field(1)).scale(Scalar.ofFields([exp]))
    );
  });

  return packet;
}
