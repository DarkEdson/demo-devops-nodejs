import request from 'supertest';
import { app } from '../..';

describe('Health Check', () => {
  test('GET /health should return 200 OK', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.text).toBe('Health check OK');
  });
});