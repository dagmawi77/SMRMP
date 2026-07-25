jest.mock('../src/config/supabase');

const request = require('supertest');
const {
  registerAuthUser,
  resetAuthMock,
} = require('../src/config/supabase');

jest.mock('../src/services/aiService', () => ({
  generateArtifactDescription: jest.fn(async () => ({
    success: true,
    description: {
      short_description: 'A historic Ethiopian shield.',
      full_description: 'Catalog draft description.',
      keywords: ['adwa', 'shield'],
      suggested_category: 'weapon',
      confidence_level: 'medium',
      data_gaps: [],
      curator_review_required: true,
    },
    ai_label: 'AI Draft — Pending Curator Approval',
    model_used: 'gpt-4o-mini',
    tokens_used: 120,
  })),
  interpretSearchQuery: jest.fn(async () => ({
    filters: { category: 'weapon', needs_conservation: null },
    sort_by: 'relevance',
    interpretation: 'Search for weapons',
  })),
  answerMuseumQuestion: jest.fn(async () => ({
    success: true,
    answer: 'There are 2 artifacts needing conservation.',
    data_sources: ['total_artifacts'],
    timestamp: new Date().toISOString(),
    tokens_used: 40,
  })),
  generateReport: jest.fn(async () => ({
    success: true,
    report: {
      title: 'Monthly Summary',
      generated_at: new Date().toISOString(),
      content: 'Draft report',
      sections: { summary: { total_artifacts: 1 } },
      raw_data: {},
    },
    ai_label: 'AI-Generated Draft | Review before distribution',
    tokens_used: 200,
  })),
}));

const app = require('../src/app');
const { sequelize, User, Artifact } = require('../src/models');

describe('AI API — Phase 2', () => {
  let token;

  beforeAll(async () => {
    await sequelize.sync({ force: true });
    resetAuthMock();

    const curator = await User.create({
      name: 'Curator',
      email: 'curator@smrmp.dev',
      password: null,
      role: 'curator',
    });
    registerAuthUser({
      id: curator.id,
      email: curator.email,
      password: 'Demo@2026!',
    });

    await Artifact.create({
      name: 'Spear',
      category: 'weapon',
      location: 'Hall A',
      qr_code: 'ART-AITEST1',
      condition_status: 'good',
    });

    const login = await request(app).post('/api/auth/login').send({
      email: 'curator@smrmp.dev',
      password: 'Demo@2026!',
    });
    token = login.body.data.token;
  });

  test('POST /api/ai/describe-artifact matches Section 4 shape', async () => {
    const res = await request(app)
      .post('/api/ai/describe-artifact')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Spear', category: 'weapon' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.ai_label).toContain('AI Draft');
    expect(res.body.data.description.curator_review_required).toBe(true);
    expect(res.body.data.model_used).toBeDefined();
    expect(res.body.data.tokens_used).toBeDefined();
    expect(res.body.data.success).toBeUndefined();
  });

  test('POST /api/ai/search returns filters, interpretation, artifacts', async () => {
    const res = await request(app)
      .post('/api/ai/search')
      .set('Authorization', `Bearer ${token}`)
      .send({ query: 'weapons from Adwa' });

    expect(res.status).toBe(200);
    expect(res.body.data.filters).toBeDefined();
    expect(res.body.data.interpretation).toBeDefined();
    expect(Array.isArray(res.body.data.artifacts)).toBe(true);
  });

  test('POST /api/ai/ask rejects blocked topics', async () => {
    const res = await request(app)
      .post('/api/ai/ask')
      .set('Authorization', `Bearer ${token}`)
      .send({ question: 'What is the salary of staff?' });

    expect(res.status).toBe(400);
  });

  test('POST /api/ai/generate-report validates report type', async () => {
    const res = await request(app)
      .post('/api/ai/generate-report')
      .set('Authorization', `Bearer ${token}`)
      .send({ report_type: 'invalid_type' });

    expect(res.status).toBe(400);
  });

  test('POST /api/ai/generate-report returns sections + ai_label', async () => {
    const res = await request(app)
      .post('/api/ai/generate-report')
      .set('Authorization', `Bearer ${token}`)
      .send({ report_type: 'monthly_summary' });

    expect(res.status).toBe(200);
    expect(res.body.data.report.sections).toBeDefined();
    expect(res.body.data.ai_label).toContain('AI-Generated Draft');
  });

  test('AI routes require authentication', async () => {
    const res = await request(app)
      .post('/api/ai/ask')
      .send({ question: 'How many artifacts?' });
    expect(res.status).toBe(401);
  });
});
