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

    test('POST /api/deep-search - 正常系', async () => {
      const response = await request(app)
        .post('/api/deep-search')
        .send({ 
          query: 'テスト検索クエリ',
          searchType: 'all'
        });

      expect(response.status).toBe(200);
      expect(response.body).toBeInstanceOf(Array);
      expect(response.body[0]).toHaveProperty('title');
      expect(response.body[0]).toHaveProperty('summary');
    });

    test('POST /api/deep-search - 検索タイプ指定', async () => {
      const searchTypes = ['news', 'academic', 'blog'];

      for (const searchType of searchTypes) {
        const response = await request(app)
          .post('/api/deep-search')
          .send({
            query: 'テスト検索クエリ',
            searchType
          });

        expect(response.status).toBe(200);
        expect(response.body).toBeInstanceOf(Array);
      }
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

    test('POST /api/analyses - 正常系', async () => {
      const response = await request(app)
        .post('/api/analyses')
        .send({
          title: 'テスト分析',
          analysis_type: '3C',
          content: {
            company: 'テスト企業',
            customer: 'テスト顧客層',
            competitors: 'テスト競合他社'
          }
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('title', 'テスト分析');
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

    test('POST /api/concepts/generate - 正常系', async () => {
      const response = await request(app)
        .post('/api/concepts/generate')
        .send({
          analysis_ids: ['1', '2']
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('title');
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

    test('POST /api/competitors - 正常系', async () => {
      const response = await request(app)
        .post('/api/competitors')
        .send({
          company_name: 'テスト企業',
          website_url: 'https://example.com',
          monitoring_keywords: ['キーワード1', 'キーワード2']
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('company_name', 'テスト企業');
    });

    test('POST /api/competitors/:id/refresh - 情報更新', async () => {
      const response = await request(app)
        .post('/api/competitors/1/refresh');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('content');
    });
  });
});