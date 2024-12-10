import { expect } from 'chai';
import dbClient from '../utils/db';

describe('dBClient', () => {
  it('should connect to MongoDB', async () => {
    expect.assertions(1); // Add this line to specify the number of assertions
    expect(dbClient.isAlive()).to.be.true;
  });

  it('should return the number of users', async () => {
    expect.assertions(1); // Add this line to specify the number of assertions
    const nbUsers = await dbClient.nbUsers();
    expect(nbUsers).to.be.a('number');
  });

  it('should return the number of files', async () => {
    expect.assertions(1); // Add this line to specify the number of assertions
    const nbFiles = await dbClient.nbFiles();
    expect(nbFiles).to.be.a('number');
  });
});

