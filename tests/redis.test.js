import redisClient from '../utils/redis';

describe('redisClient', () => {
  it('should connect to Redis', async () => {
    expect.hasAssertions(); // Ensure this test includes assertions
    const isAlive = await redisClient.isAlive();
    expect(isAlive).toBe(true);
  });

  it('should set and get a value', async () => {
    expect.hasAssertions();
    await redisClient.set('testKey', 'testValue', 10);
    const value = await redisClient.get('testKey');
    expect(value).toBe('testValue');
  });

  it('should delete a value', async () => {
    expect.hasAssertions();
    await redisClient.set('testKey', 'testValue', 10);
    await redisClient.del('testKey');
    const value = await redisClient.get('testKey');
    expect(value).toBeNull();
  });
});

