import request from 'supertest';
import app from '../server';

describe('appController', () => {
  it('gET /status should return correct status', async () => {
    expect.assertions(3); // Ensure 3 assertions in this test
    const res = await request(app).get('/status');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('redis');
    expect(res.body).toHaveProperty('db');
  });

  it('gET /stats should return correct stats', async () => {
    expect.assertions(3); // Ensure 3 assertions in this test
    const res = await request(app).get('/stats');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('users');
    expect(res.body).toHaveProperty('files');
  });
});

describe('usersController', () => {
  it('pOST /users should create a new user', async () => {
    expect.assertions(3); // Ensure 3 assertions in this test
    const res = await request(app)
      .post('/users')
      .send({ email: 'test@example.com', password: 'password123' });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('email', 'test@example.com');
  });
});
