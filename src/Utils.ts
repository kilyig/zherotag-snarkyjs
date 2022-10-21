import { Circuit, Field } from 'snarkyjs';

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
