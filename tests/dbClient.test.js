import dbClient from '../utils/db';

describe('dbClient', () => {
  it('should connect to MongoDB', async () => {
    expect.assertions(1);
    const isAlive = dbClient.isAlive();
    expect(isAlive).toBe(true);
  });

  it('should return the number of users', async () => {
    expect.assertions(1);
    const nbUsers = await dbClient.nbUsers();
    expect(typeof nbUsers).toBe('number');
  });

  it('should return the number of files', async () => {
    expect.assertions(1);
    const nbFiles = await dbClient.nbFiles();
    expect(typeof nbFiles).toBe('number');
  });
});
