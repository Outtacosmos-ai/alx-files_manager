import { expect } from 'chai';
import request from 'supertest';
import app from '../server';
import dbClient from '../utils/db';

describe('aPI Endpoints', () => {
  let token;
  let fileId;

  before(async () => {
    await dbClient.client.db().collection('users').deleteMany({});
    await dbClient.client.db().collection('files').deleteMany({});
  });

  describe('gET /status', () => {
    it('should return the status of Redis and DB', async () => {
      expect.assertions(1); // Add this line
      const res = await request(app).get('/status');
      expect(res.statusCode).to.equal(200);
      expect(res.body).to.have.property('redis');
      expect(res.body).to.have.property('db');
    });
  });

  describe('gET /stats', () => {
    it('should return the number of users and files', async () => {
      expect.assertions(1); // Add this line
      const res = await request(app).get('/stats');
      expect(res.statusCode).to.equal(200);
      expect(res.body).to.have.property('users');
      expect(res.body).to.have.property('files');
    });
  });

  describe('pOST /users', () => {
    it('should create a new user', async () => {
      expect.assertions(1); // Add this line
      const res = await request(app)
        .post('/users')
        .send({ email: 'test@example.com', password: 'password123' });
      expect(res.statusCode).to.equal(201);
      expect(res.body).to.have.property('id');
      expect(res.body).to.have.property('email', 'test@example.com');
    });
  });

  describe('gET /connect', () => {
    it('should authenticate a user and return a token', async () => {
      expect.assertions(1); // Add this line
      const res = await request(app)
        .get('/connect')
        .set('Authorization', 'Basic dGVzdEBleGFtcGxlLmNvbTpwYXNzd29yZDEyMw==');
      expect(res.statusCode).to.equal(200);
      expect(res.body).to.have.property('token');
      token = res.body.token;
    });
  });

  describe('gET /disconnect', () => {
    it('should disconnect a user', async () => {
      expect.assertions(1); // Add this line
      const res = await request(app)
        .get('/disconnect')
        .set('X-Token', token);
      expect(res.statusCode).to.equal(204);
    });
  });

  describe('gET /users/me', () => {
    it('should return the current user', async () => {
      expect.assertions(1); // Add this line
      const res = await request(app)
        .get('/users/me')
        .set('X-Token', token);
      expect(res.statusCode).to.equal(200);
      expect(res.body).to.have.property('id');
      expect(res.body).to.have.property('email', 'test@example.com');
    });
  });

  describe('pOST /files', () => {
    it('should create a new file', async () => {
      expect.assertions(1); // Add this line
      const res = await request(app)
        .post('/files')
        .set('X-Token', token)
        .send({
          name: 'test.txt',
          type: 'file',
          data: 'SGVsbG8gV29ybGQ=',
        });
      expect(res.statusCode).to.equal(201);
      expect(res.body).to.have.property('id');
      fileId = res.body.id;
    });
  });

  describe('gET /files/:id', () => {
    it('should return a file by id', async () => {
      expect.assertions(1); // Add this line
      const res = await request(app)
        .get(`/files/${fileId}`)
        .set('X-Token', token);
      expect(res.statusCode).to.equal(200);
      expect(res.body).to.have.property('id', fileId);
    });
  });

  describe('gET /files', () => {
    it('should return a list of files with pagination', async () => {
      expect.assertions(1); // Add this line
      const res = await request(app)
        .get('/files')
        .set('X-Token', token)
        .query({ page: 0 });
      expect(res.statusCode).to.equal(200);
      expect(res.body).to.be.an('array');
    });
  });

  describe('pUT /files/:id/publish', () => {
    it('should publish a file', async () => {
      expect.assertions(1); // Add this line
      const res = await request(app)
        .put(`/files/${fileId}/publish`)
        .set('X-Token', token);
      expect(res.statusCode).to.equal(200);
      expect(res.body).to.have.property('isPublic', true);
    });
  });

  describe('pUT /files/:id/unpublish', () => {
    it('should unpublish a file', async () => {
      expect.assertions(1); // Add this line
      const res = await request(app)
        .put(`/files/${fileId}/unpublish`)
        .set('X-Token', token);
      expect(res.statusCode).to.equal(200);
      expect(res.body).to.have.property('isPublic', false);
    });
  });

  describe('gET /files/:id/data', () => {
    it('should return the content of a file', async () => {
      expect.assertions(1); // Add this line
      const res = await request(app)
        .get(`/files/${fileId}/data`)
        .set('X-Token', token);
      expect(res.statusCode).to.equal(200);
      expect(res.text).to.equal('Hello World');
    });
  });

  after(async () => {
    await dbClient.client.close();
  });
});

