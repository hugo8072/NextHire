import request from 'supertest';
import app from '../index.js';

describe('POST /login', () => {
  it('should return 200 and login successful message for valid credentials', async () => {
    const response = await request(app)
      .post('/login')
      .send({ username: 'user', password: 'pass' });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Login successful');
  });

  it('should return 401 for invalid credentials', async () => {
    const response = await request(app)
      .post('/login')
      .send({ username: 'invalidUser', password: 'invalidPass' });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Invalid credentials');
  });

  it('should redirect HTTP to HTTPS and then return 200 for valid credentials', async () => {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'; // Ignore self-signed certificate

    const response = await request(app)
      .post('/login')
      .set('X-Forwarded-Proto', 'http')
      .send({ username: 'user', password: 'pass' })
      .redirects(1); // Follow the redirect

    console.log('Redirect URL:', response.headers.location); // Log the redirect URL

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Login successful');
  });
});