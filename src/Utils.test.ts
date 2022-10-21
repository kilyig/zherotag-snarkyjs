import { modexp } from './Utils';
import { Field, isReady, shutdown } from 'snarkyjs';

describe('modexp function', () => {
  beforeAll(async () => {
    await isReady;
  });

  afterAll(async () => {
    setTimeout(shutdown, 0);
  });

  test('exponents of 1', () => {
    for (let exp: number = 0; exp <= 10; exp++) {
      expect(modexp(Field(1), exp)).toEqual(Field(1));
    }
  });

  test('exponents of 2', () => {
    expect(modexp(Field(2), 0)).toEqual(Field(1));
    expect(modexp(Field(2), 1)).toEqual(Field(2));
    expect(modexp(Field(2), 2)).toEqual(Field(4));
    expect(modexp(Field(2), 3)).toEqual(Field(8));
    expect(modexp(Field(2), 4)).toEqual(Field(16));
    expect(modexp(Field(2), 5)).toEqual(Field(32));
    expect(modexp(Field(2), 6)).toEqual(Field(64));
  });

  test('exponents of -1', () => {
    // even powers are 1
    for (let exp: number = 0; exp <= 20; exp += 2) {
      expect(modexp(Field.minusOne, exp)).toEqual(Field(1));
    }

    // odd powers are -1
    for (let exp: number = 1; exp <= 21; exp += 2) {
      expect(modexp(Field.minusOne, exp)).toEqual(Field.minusOne);
    }
  });

  test('exponents of -2', () => {
    expect(modexp(Field(-2), 0)).toEqual(Field(1));
    expect(modexp(Field(-2), 1)).toEqual(Field(-2));
    expect(modexp(Field(-2), 2)).toEqual(Field(4));
    expect(modexp(Field(-2), 3)).toEqual(Field(-8));
    expect(modexp(Field(-2), 4)).toEqual(Field(16));
    expect(modexp(Field(-2), 5)).toEqual(Field(-32));
    expect(modexp(Field(-2), 6)).toEqual(Field(64));
  });

  test('commutativity', () => {
    let exp_1 = 3;
    let exp_2 = 7;
    let base: Field = Field(5);

    let exp_1_first = modexp(modexp(base, exp_1), exp_2);
    let exp_2_first = modexp(modexp(base, exp_2), exp_1);

    expect(exp_1_first).toEqual(exp_2_first);
  });

  test('add exponents then raise = raise to exponents and then multiply', () => {
    let exp_1 = 3;
    let exp_2 = 7;
    let base: Field = Field(5);

    let add_then_raise = modexp(base, exp_1 + exp_2);
    let raise_then_multiply = modexp(base, exp_1).mul(modexp(base, exp_2));

    expect(add_then_raise).toEqual(raise_then_multiply);
  });
});
