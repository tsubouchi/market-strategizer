import { describe, expect, test, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import express, { Express } from 'express';
import { registerRoutes } from '../../server/routes';
import { Server } from 'http';

describe('API Endpoints', () => {
  let app: Express;
  let server: Server;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    server = registerRoutes(app);
  });

  afterAll((done) => {
    server.close(done);
  });

  // 深層検索APIのテスト
  describe('Deep Search API', () => {
    test('POST /api/deep-search - クエリなし', async () => {
      const response = await request(app)
        .post('/api/deep-search')
        .send({ searchType: 'all' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  // 分析履歴APIのテスト
  describe('Analyses API', () => {
    test('GET /api/analyses - 一覧取得', async () => {
      const response = await request(app).get('/api/analyses');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    test('POST /api/analyses - 必須項目なし', async () => {
      const response = await request(app)
        .post('/api/analyses')
        .send({});

      expect(response.status).toBe(400);
    });
  });

  // コンセプト生成APIのテスト
  describe('Concepts API', () => {
    test('GET /api/concepts - 一覧取得', async () => {
      const response = await request(app).get('/api/concepts');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    test('POST /api/concepts/generate - 必須項目なし', async () => {
      const response = await request(app)
        .post('/api/concepts/generate')
        .send({});

      expect(response.status).toBe(400);
    });
  });

  // 競合他社モニタリングAPIのテスト
  describe('Competitors API', () => {
    test('GET /api/competitors - 一覧取得', async () => {
      const response = await request(app).get('/api/competitors');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    test('POST /api/competitors - 必須項目なし', async () => {
      const response = await request(app)
        .post('/api/competitors')
        .send({});

      expect(response.status).toBe(400);
    });
  });
});