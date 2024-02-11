import request from 'supertest';
import { app } from '../..';
import sequelize from '../../shared/database/database';

beforeAll((done) => {
    sequelize.sync({ force: true }).then(() => {
      done(); 
    });
  });
describe('Health Check', () => {

    afterAll(async () => {
        server.close()
    })
  test('GET /health should return 200 OK', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.text).toBe('Health check OK');
  });
});