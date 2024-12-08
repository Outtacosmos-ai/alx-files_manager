import dbClient from '../utils/db';

describe('dBClient', () => {
  it('should connect to MongoDB', async () => {
    expect.assertions(1); // Ensure at least one assertion
    const isAlive = await dbClient.isAlive();
    expect(isAlive).toBe(true); // Use Jest's `toBe` matcher
  });

  it('should return the number of users', async () => {
    expect.assertions(1); // Ensure at least one assertion
    const nbUsers = await dbClient.nbUsers();
    expect(typeof nbUsers).toBe('number'); // Use Jest's type-checking with `toBe`
  });

  // Add more tests here...
});
