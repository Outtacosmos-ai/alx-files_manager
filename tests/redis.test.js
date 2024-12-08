import { expect } from 'chai';
import redisClient from '../utils/redis';

describe('RedisClient', () => {
  it('should connect to Redis', () => {
    expect(redisClient.isAlive()).to.be.true;
  });

  it('should set and get a value', async () => {
    await redisClient.set('testKey', 'testValue', 10);
    const value = await redisClient.get('testKey');
    expect(value).to.equal('testValue');
  });

  it('should delete a value', async () => {
    await redisClient.set('testKey', 'testValue', 10);
    await redisClient.del('testKey');
    const value = await redisClient.get('testKey');
    expect(value).to.be.null;
  });
});
