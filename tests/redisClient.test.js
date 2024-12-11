import redisClient from '../utils/redis';

describe('redisClient', () => {
  it('should connect to Redis', async () => {
    expect.assertions(1);
    const isAlive = redisClient.isAlive();
    expect(isAlive).toBe(true);
  });

  it('should set and get a value', async () => {
    expect.assertions(1);
    await redisClient.set('testKey', 'testValue', 10);
    const value = await redisClient.get('testKey');
    expect(value).toBe('testValue');
  });

  it('should delete a value', async () => {
    expect.assertions(1);
    await redisClient.set('testKey', 'testValue', 10);
    await redisClient.del('testKey');
    const value = await redisClient.get('testKey');
    expect(value).toBeNull();
  });
});
