import { modexp } from './Utils';
import { Field, isReady, shutdown } from 'snarkyjs';

describe('modexp function', () => {
  beforeAll(async () => {
    await isReady;
  });

  afterAll(async () => {
    setTimeout(shutdown, 0);
  });

  test('returns 1 (dummy)', () => {
    expect(modexp(Field(7), Field(15))).toEqual(Field(1));
  });
});
