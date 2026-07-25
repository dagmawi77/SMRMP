const OpenAI = require('openai');
const { Op } = require('sequelize');
const { Artifact, Exhibition, Ticket, TicketType } = require('../models');
const { aggregateReportData } = require('./reportService');
const { startOfMonth } = require('../utils/dateHelpers');

let openaiClient = null;
const getOpenAI = () => {
  if (!openaiClient) {
    const apiKey = process.env.OPENAI_API_KEY;
    const baseURL =
      process.env.OPENAI_BASE_URL ||
      (apiKey && apiKey.startsWith('sk-or-')
        ? 'https://openrouter.ai/api/v1'
        : undefined);

    const clientOptions = { apiKey };
    if (baseURL) {
      clientOptions.baseURL = baseURL;
      clientOptions.defaultHeaders = {
        'HTTP-Referer': process.env.FRONTEND_URL || 'http://localhost:3000',
        'X-Title': 'SMRMP Museum Platform',
      };
    }
    openaiClient = new OpenAI(clientOptions);
  }
  return openaiClient;
};

const AI_MODEL = process.env.OPENAI_MODEL || 'openai/gpt-4o-mini';
const MAX_TOKENS = 1500;

const parseJsonResponse = (content) => {
  if (!content) return {};
  let cleaned = content.trim();
  // Strip markdown code fences if present
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
  // If there's leading/trailing text around JSON, extract the JSON object
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  }
  return JSON.parse(cleaned);
};

const generateArtifactDescription = async (artifactData) => {
  const {
    name,
    category,
    historical_period,
    origin,
    materials,
    staff_notes = '',
  } = artifactData;

  const systemPrompt = `You are a museum documentation assistant
for the Adwa Victory Memorial Museum in Ethiopia. Generate
accurate, culturally respectful, and professionally written
artifact descriptions in both English and Amharic (አማርኛ).

You must:
- Write in formal museum catalog style
- Provide both English (full_description) and authentic Amharic (amharic_description) narratives
- Be historically accurate and culturally sensitive
- Never fabricate historical facts not in the provided data
- Use phrases like "believed to be", "circa", "attributed to" (in English) and "እንደሚገመተው", "በኪነ-ጥበቡ እንደሚያሳየው" (in Amharic) when uncertain
- Flag insufficient data fields explicitly

Always output valid JSON only. No explanation outside JSON.`;

  const userPrompt = `Generate a museum catalog entry for:

Artifact Name: ${name}
Category: ${category}
Historical Period: ${historical_period || 'Unknown'}
Geographic Origin: ${origin || 'Unknown'}
Materials: ${materials || 'Unknown'}
Staff Notes: ${staff_notes || 'None provided'}

Output this exact JSON structure:
{
  "short_description": "1 sentence, max 25 words",
  "full_description": "2 paragraphs, professional catalog style in English",
  "amharic_description": "2 paragraphs, professional catalog style in proper Amharic script (አማርኛ)",
  "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
  "suggested_category": "most appropriate category",
  "confidence_level": "high | medium | low",
  "data_gaps": ["list any fields that limited description quality"],
  "curator_review_required": true
}`;

  try {
    const completion = await getOpenAI().chat.completions.create({
      model: AI_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: MAX_TOKENS,
      temperature: 0.3,
      response_format: { type: 'json_object' },
    });

    const parsed = parseJsonResponse(completion.choices[0].message.content);

    return {
      success: true,
      description: {
        ...parsed,
        curator_review_required: true,
      },
      ai_label: 'AI Draft — Pending Curator Approval',
      model_used: AI_MODEL,
      tokens_used: completion.usage.total_tokens,
    };
  } catch (error) {
    if (error.code === 'insufficient_quota') {
      throw new Error('AI quota exceeded. Contact administrator.');
    }
    throw new Error(`AI description failed: ${error.message}`);
  }
};

const interpretSearchQuery = async (query) => {
  const systemPrompt = `You are a search query interpreter for a
museum artifact database. Convert natural language to structured
filter objects. Output valid JSON only.

Available filter fields:
- name: string (partial match)
- category: one of [weapon, textile, document, ceramic,
  jewelry, ceremonial, photograph, coin, other]
- historical_period: string
- origin: string
- condition_status: one of [excellent, good, fair, poor, critical]
- location: string
- needs_conservation: boolean (true = poor or critical)

Output format:
{
  "filters": {
    "name": null or string,
    "category": null or string,
    "historical_period": null or string,
    "origin": null or string,
    "condition_status": null or string,
    "location": null or string,
    "needs_conservation": null or boolean
  },
  "sort_by": "relevance | date_added | condition",
  "interpretation": "1 sentence explaining search intent"
}`;

  try {
    const completion = await getOpenAI().chat.completions.create({
      model: AI_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Query: "${query}"` },
      ],
      max_tokens: 300,
      temperature: 0.1,
      response_format: { type: 'json_object' },
    });

    return parseJsonResponse(completion.choices[0].message.content);
  } catch (_error) {
    return {
      filters: { name: query },
      sort_by: 'relevance',
      interpretation: `Keyword search for "${query}" (AI service unavailable)`,
    };
  }
};

const answerMuseumQuestion = async (question) => {
  const [
    totalArtifacts,
    conservationCount,
    criticalArtifacts,
    activeExhibitions,
    ticketsThisMonth,
  ] = await Promise.all([
    Artifact.count(),
    Artifact.count({
      where: { condition_status: { [Op.in]: ['poor', 'critical'] } },
    }),
    Artifact.findAll({
      where: { condition_status: 'critical' },
      attributes: ['name'],
      limit: 5,
    }),
    Exhibition.count({ where: { status: 'active' } }),
    Ticket.count({
      where: {
        payment_status: 'completed',
        created_at: { [Op.gte]: startOfMonth() },
      },
    }),
  ]);

  const contextData = {
    total_artifacts: totalArtifacts,
    artifacts_needing_conservation: conservationCount,
    critical_artifacts: criticalArtifacts.map((a) => a.name),
    active_exhibitions: activeExhibitions,
    tickets_sold_this_month: ticketsThisMonth,
  };

  const systemPrompt = `You are an operational assistant for
the Adwa Victory Memorial Museum. Answer questions strictly
using the provided data context. Rules:
- Answer in 1-3 clear sentences
- Use exact numbers from context only
- If data is insufficient, say so clearly
- Never recommend specific conservation treatments
- End risk-related answers with: "Please consult the
  conservation team for action."
- Do not invent or estimate figures not in context`;

  try {
    const completion = await getOpenAI().chat.completions.create({
      model: AI_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: `Current museum data:\n${JSON.stringify(contextData, null, 2)}\n\nQuestion: ${question}`,
        },
      ],
      max_tokens: 300,
      temperature: 0.2,
    });

    return {
      success: true,
      answer: completion.choices[0].message.content,
      data_sources: Object.keys(contextData),
      timestamp: new Date().toISOString(),
      tokens_used: completion.usage.total_tokens,
    };
  } catch (error) {
    throw new Error(`Q&A assistant failed: ${error.message}`);
  }
};

/**
 * Visitor-facing museum guide Q&A (Telegram / public web).
 * Uses public exhibition + artifact context; never exposes staff/conservation internals.
 */
const answerVisitorQuestion = async (question, language = 'en') => {
  const [exhibitions, sampleArtifacts, ticketTypes] = await Promise.all([
    Exhibition.findAll({
      where: { status: { [Op.in]: ['active', 'planning'] } },
      attributes: ['name', 'description', 'theme', 'gallery', 'start_date', 'end_date', 'status'],
      limit: 8,
      order: [['start_date', 'DESC']],
    }),
    Artifact.findAll({
      attributes: ['name', 'category', 'historical_period', 'origin', 'location'],
      limit: 12,
      order: [['created_at', 'DESC']],
    }),
    TicketType.findAll({
      where: { is_active: true },
      attributes: ['label', 'price_etb', 'description'],
      order: [['price_etb', 'ASC']],
    }),
  ]);

  const contextData = {
    museum: 'Adwa Victory Memorial Museum, Addis Ababa, Ethiopia',
    exhibitions: exhibitions.map((e) => e.toJSON()),
    featured_artifacts: sampleArtifacts.map((a) => a.toJSON()),
    ticket_types: ticketTypes.map((t) => ({
      label: t.label,
      price_etb: Number(t.price_etb),
      description: t.description,
    })),
  };

  const langRule =
    language === 'am'
      ? 'Prefer answering in Amharic (አማርኛ). If mixed, Amharic first then a short English line.'
      : 'Answer in clear simple English. You may add a short Amharic greeting if natural.';

  const systemPrompt = `You are a friendly visitor guide for the Adwa Victory Memorial Museum.
Help guests with hours, tickets, exhibitions, galleries, and general history of Adwa / Ethiopian heritage.
Rules:
- ${langRule}
- Keep answers short (2-5 sentences) for mobile chat
- Use only the provided museum context for facts about current exhibitions and tickets
- For deep historical claims beyond context, say you can guide them to the gallery plaques / curator
- Never discuss staff salaries, conservation treatments, passwords, or internal ops
- Be warm, respectful, and suitable for families and school groups`;

  try {
    const completion = await getOpenAI().chat.completions.create({
      model: AI_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: `Museum context:\n${JSON.stringify(contextData, null, 2)}\n\nVisitor question: ${question}`,
        },
      ],
      max_tokens: 400,
      temperature: 0.4,
    });

    return {
      success: true,
      answer: completion.choices[0].message.content,
      data_sources: ['exhibitions', 'artifacts', 'ticket_types'],
      timestamp: new Date().toISOString(),
      tokens_used: completion.usage.total_tokens,
    };
  } catch (error) {
    throw new Error(`Visitor Q&A failed: ${error.message}`);
  }
};

const generateReport = async (reportType) => {
  const reportData = await aggregateReportData(reportType);

  const reportPrompts = {
    daily_operations: 'Write a daily operations report.',
    monthly_summary: 'Write a comprehensive monthly summary report.',
    conservation_status:
      'Write a conservation status report focusing on artifact condition and risk.',
    visitor_analytics:
      'Write a visitor analytics report focusing on ticketing and attendance trends.',
    executive_overview:
      'Write a concise executive overview suitable for board or ministry review.',
  };

  const systemPrompt = `You are a professional report writer for
a museum management system. Generate structured institutional
reports. All reports must be clearly labeled as AI drafts.
Use professional, factual language. No marketing language.
Flag uncertainties explicitly.`;

  const userPrompt = `${reportPrompts[reportType] || reportPrompts.monthly_summary}

Museum Data:
${JSON.stringify(reportData, null, 2)}

Structure the report with:
1. Header (Museum name, date, report type)
2. Executive Summary (3-4 sentences)
3. Key Metrics (formatted)
4. Notable Findings (data-grounded bullets)
5. Items Requiring Attention (flags only)
6. Recommended Next Steps

End with: "AI-Generated Draft | Review required before
official distribution | Generated: ${new Date().toISOString()}"`;

  try {
    const completion = await getOpenAI().chat.completions.create({
      model: AI_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: 1500,
      temperature: 0.4,
    });

    return {
      success: true,
      report: {
        title: `${reportType
          .replace(/_/g, ' ')
          .replace(/\b\w/g, (l) => l.toUpperCase())} — ${reportData.period}`,
        generated_at: reportData.generated_at,
        content: completion.choices[0].message.content,
        // Section 4 requires sections; keep raw_data for internal use
        sections: {
          period: reportData.period,
          summary: reportData.summary,
          report_type: reportData.report_type,
        },
        raw_data: reportData,
      },
      ai_label: 'AI-Generated Draft | Review before distribution',
      tokens_used: completion.usage.total_tokens,
    };
  } catch (error) {
    throw new Error(`Report generation failed: ${error.message}`);
  }
};

module.exports = {
  generateArtifactDescription,
  interpretSearchQuery,
  answerMuseumQuestion,
  answerVisitorQuestion,
  generateReport,
};
