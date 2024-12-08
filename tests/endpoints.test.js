import { expect } from 'chai';
import request from 'supertest';
import app from '../server';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

describe('API Endpoints', () => {
  let token;
  let fileId;

  before(async () => {
    // Clear the database before running tests
    await dbClient.client.db().collection('users').deleteMany({});
    await dbClient.client.db().collection('files').deleteMany({});
  });

  describe('GET /status', () => {
    it('should return the status of Redis and DB', async () => {
      const res = await request(app).get('/status');
      expect(res.statusCode).to.equal(200);
      expect(res.body).to.have.property('redis');
      expect(res.body).to.have.property('db');
    });
  });

  describe('GET /stats', () => {
    it('should return the number of users and files', async () => {
      const res = await request(app).get('/stats');
      expect(res.statusCode).to.equal(200);
      expect(res.body).to.have.property('users');
      expect(res.body).to.have.property('files');
    });
  });

  describe('POST /users', () => {
    it('should create a new user', async () => {
      const res = await request(app)
        .post('/users')
        .send({ email: 'test@example.com', password: 'password123' });
      expect(res.statusCode).to.equal(201);
      expect(res.body).to.have.property('id');
      expect(res.body).to.have.property('email', 'test@example.com');
    });
  });

  describe('GET /connect', () => {
    it('should authenticate a user and return a token', async () => {
      const res = await request(app)
        .get('/connect')
        .set('Authorization', 'Basic dGVzdEBleGFtcGxlLmNvbTpwYXNzd29yZDEyMw==');
      expect(res.statusCode).to.equal(200);
      expect(res.body).to.have.property('token');
      token = res.body.token;
    });
  });

  describe('GET /disconnect', () => {
    it('should disconnect a user', async () => {
      const res = await request(app)
        .get('/disconnect')
        .set('X-Token', token);
      expect(res.statusCode).to.equal(204);
    });
  });

  describe('GET /users/me', () => {
    it('should return the current user', async () => {
      const res = await request(app)
        .get('/users/me')
        .set('X-Token', token);
      expect(res.statusCode).to.equal(200);
      expect(res.body).to.have.property('id');
      expect(res.body).to.have.property('email', 'test@example.com');
    });
  });

  describe('POST /files', () => {
    it('should create a new file', async () => {
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

  describe('GET /files/:id', () => {
    it('should return a file by id', async () => {
      const res = await request(app)
        .get(`/files/${fileId}`)
        .set('X-Token', token);
      expect(res.statusCode).to.equal(200);
      expect(res.body).to.have.property('id', fileId);
    });
  });

  describe('GET /files', () => {
    it('should return a list of files with pagination', async () => {
      const res = await request(app)
        .get('/files')
        .set('X-Token', token)
        .query({ page: 0 });
      expect(res.statusCode).to.equal(200);
      expect(res.body).to.be.an('array');
    });
  });

  describe('PUT /files/:id/publish', () => {
    it('should publish a file', async () => {
      const res = await request(app)
        .put(`/files/${fileId}/publish`)
        .set('X-Token', token);
      expect(res.statusCode).to.equal(200);
      expect(res.body).to.have.property('isPublic', true);
    });
  });

  describe('PUT /files/:id/unpublish', () => {
    it('should unpublish a file', async () => {
      const res = await request(app)
        .put(`/files/${fileId}/unpublish`)
        .set('X-Token', token);
      expect(res.statusCode).to.equal(200);
      expect(res.body).to.have.property('isPublic', false);
    });
  });

  describe('GET /files/:id/data', () => {
    it('should return the content of a file', async () => {
      const res = await request(app)
        .get(`/files/${fileId}/data`)
        .set('X-Token', token);
      expect(res.statusCode).to.equal(200);
      expect(res.text).to.equal('Hello World');
    });
  });

  after(async () => {
    // Close the MongoDB connection after all tests
    await dbClient.client.close();
    // Close the Redis connection
    await redisClient.client.quit();
  });
});
