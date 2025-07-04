import { db } from './db.js';

describe('db', () => {
  it('should work', () => {
    expect(db()).toEqual('db');
  });
});
