import dbClient from '../utils/db';

describe('dbClient', () => {
  it('should connect to MongoDB', async () => {
    expect.assertions(1); // Ensure 1 assertion in this test
    expect(await dbClient.isAlive()).toBe(true); // Replaced with Jest assertion
  });

  it('should return the number of users', async () => {
    expect.assertions(1); // Ensure 1 assertion in this test
    const nbUsers = await dbClient.nbUsers();
    expect(nbUsers).toBeGreaterThan(0); // Ensuring the value is a number greater than 0
  });

  it('should return the number of files', async () => {
    expect.assertions(1); // Ensure 1 assertion in this test
    const nbFiles = await dbClient.nbFiles();
    expect(nbFiles).toBeGreaterThan(0); // Ensuring the value is a number greater than 0
  });
});
