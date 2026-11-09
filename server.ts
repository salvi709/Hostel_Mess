import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
// Environment constraint: Dev server must run on port 3000.
const PORT = 3000;

app.use(express.json({ limit: '1mb' }));

// Initialize Google GenAI client securely on server side
// Note: Telemetry header 'aistudio-build' is required
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

import { validateReviewText, MSG_IRRELEVANT, MSG_UNCERTAIN } from './src/utils/reviewValidation';

export interface ReviewValidationResult {
  decision: 'RELEVANT' | 'IRRELEVANT' | 'UNCERTAIN';
  confidence: number;
  category: 
    | 'TASTE' 
    | 'FOOD_QUALITY' 
    | 'QUANTITY' 
    | 'HYGIENE' 
    | 'SERVICE' 
    | 'MEAL_EXPERIENCE' 
    | 'OTHER_RELEVANT' 
    | 'UNRELATED' 
    | 'SPAM';
  reason: string;
  suggestion?: string;
  userMessage?: string;
}

// API Routes (handled before vite middlewares)
app.post('/api/validate-review', async (req, res) => {
  try {
    const { reviewText, mealType, messName, collegeName, dishes } = req.body || {};

    // Basic Input Constraints
    if (!reviewText || typeof reviewText !== 'string' || reviewText.trim().length === 0) {
      return res.status(400).json({
        error: 'Review text is required for validation.',
        decision: 'IRRELEVANT',
        userMessage: MSG_IRRELEVANT,
      });
    }

    const trimmed = reviewText.trim();
    if (trimmed.length > 1000) {
      return res.status(400).json({
        error: 'Review text exceeds maximum length of 1000 characters.',
        decision: 'IRRELEVANT',
        userMessage: MSG_IRRELEVANT,
      });
    }

    // Step 1: Run authoritative deterministic validation
    const deterministicCheck = validateReviewText(trimmed);

    // If deterministic check finds pure greeting/spam/gibberish (like 'hi', 'hello bro', 'asdfghjkl', '123456789'),
    // reject IMMEDIATELY without allowing any model hallucinations or bypasses.
    if (deterministicCheck.decision === 'IRRELEVANT') {
      return res.json({
        ...deterministicCheck,
        suggestion: MSG_IRRELEVANT,
        userMessage: MSG_IRRELEVANT,
      });
    }

    // If deterministic check has high confidence (> 0.9) of relevance (e.g., explicit dish & taste mention),
    // return immediately for instant response time
    if (deterministicCheck.decision === 'RELEVANT' && deterministicCheck.confidence >= 0.9) {
      return res.json({
        ...deterministicCheck,
      });
    }

    // Check if GEMINI_API_KEY is available and valid
    const apiKey = process.env.GEMINI_API_KEY;
    const hasValidApiKey = apiKey && apiKey.trim().length > 0 && apiKey !== 'MY_GEMINI_API_KEY';

    if (!hasValidApiKey) {
      return res.json({
        ...deterministicCheck,
        suggestion: deterministicCheck.decision === 'UNCERTAIN' ? MSG_UNCERTAIN : undefined,
        userMessage: deterministicCheck.decision === 'UNCERTAIN' ? MSG_UNCERTAIN : undefined,
      });
    }

    // Call Gemini 3.1 Flash-Lite for fast, reliable Structured Review Evaluation
    const systemInstruction = `You are a strict, expert student dining review evaluator for a university hostel mess feedback system.
Your job is to determine whether a student's written review contains MEANINGFUL information about:
- Food taste (e.g. too salty, spicy, sweet, bland, delicious)
- Food quality (e.g. freshness, stale, cold, hot, burnt, raw, undercooked)
- Food quantity (e.g. portion size, insufficient, not enough, plenty)
- Food hygiene (e.g. clean, dirty, hair, insects, clean plates/tables)
- Meal temperature or freshness
- Today's menu or dishes served
- Mess cleanliness or dining service
- Overall dining experience

STRICT MANDATORY EXAMPLES:
- "Hi" -> REJECT (IRRELEVANT)
- "Hello bro" -> REJECT (IRRELEVANT)
- "How are you?" -> REJECT (IRRELEVANT)
- "Good morning" -> REJECT (IRRELEVANT)
- "Nice day" -> REJECT (IRRELEVANT)
- "asdfghjkl" -> REJECT (IRRELEVANT)
- "123456789" -> REJECT (IRRELEVANT)
- "Food was good" -> ACCEPT (RELEVANT)
- "Today's dal was too salty" -> ACCEPT (RELEVANT)
- "The rice was undercooked" -> ACCEPT (RELEVANT)
- "The food quantity was insufficient" -> ACCEPT (RELEVANT)
- "The food was terrible" -> ACCEPT (RELEVANT)
- "Roti was hard as rock" -> ACCEPT (RELEVANT)
- "Clean tables please" -> ACCEPT (RELEVANT)

If the review is only a casual greeting, conversational chat, joke, random questions, phone/shopping talk, or meaningless gibberish, classify it as IRRELEVANT.
If the review expresses genuine food/mess feedback (positive or negative, even if informal, slang, or short), classify it as RELEVANT.
If it is ambiguous or too short to tell (e.g. "Maybe", "Okayish", "Okiesh"), classify as UNCERTAIN.`;

    const prompt = `Context:
- Meal Type: ${mealType || 'Not specified'}
- Menu/Dishes served: ${dishes || 'General mess menu'}
- Mess / Dining Hall: ${messName || 'Hostel Mess'}
- Institution: ${collegeName || 'Campus'}

Student's written review to evaluate:
"${trimmed}"`;

    // 3.5-second timeout race to prevent UI hanging on network latency or API spikes
    const generateCall = ai.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            decision: {
              type: Type.STRING,
              enum: ['RELEVANT', 'IRRELEVANT', 'UNCERTAIN'],
              description: 'Whether the review is genuine mess/food feedback.',
            },
            confidence: {
              type: Type.NUMBER,
              description: 'Confidence between 0.0 and 1.0.',
            },
            category: {
              type: Type.STRING,
              enum: [
                'TASTE',
                'FOOD_QUALITY',
                'QUANTITY',
                'HYGIENE',
                'SERVICE',
                'MEAL_EXPERIENCE',
                'OTHER_RELEVANT',
                'UNRELATED',
                'SPAM',
              ],
              description: 'The specific category of the feedback.',
            },
            reason: {
              type: Type.STRING,
              description: 'Concise explanation of the decision.',
            },
            suggestion: {
              type: Type.STRING,
              description: 'Optional friendly suggestion if irrelevant or uncertain.',
            },
          },
          required: ['decision', 'confidence', 'category', 'reason'],
        },
      },
    });

    const timeoutCall = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Gemini API call timed out after 3500ms')), 3500)
    );

    const response = await Promise.race([generateCall, timeoutCall]);

    const parsed: ReviewValidationResult = JSON.parse(response.text || '{}');

    // Server-side sanity checks on the LLM output
    if (!['RELEVANT', 'IRRELEVANT', 'UNCERTAIN'].includes(parsed.decision)) {
      parsed.decision = deterministicCheck.decision;
    }

    if (parsed.decision === 'IRRELEVANT') {
      parsed.userMessage = MSG_IRRELEVANT;
    } else if (parsed.decision === 'UNCERTAIN') {
      parsed.userMessage = MSG_UNCERTAIN;
    }

    return res.json(parsed);
  } catch (err: any) {
    console.warn('Gemini review validation fallback activated:', err?.message || err);
    // On any API error, high demand, or timeout, immediately return the deterministic validation result
    const fallback = validateReviewText(req.body?.reviewText || '');
    return res.json({
      ...fallback,
      userMessage: fallback.decision === 'IRRELEVANT' ? MSG_IRRELEVANT : (fallback.decision === 'UNCERTAIN' ? MSG_UNCERTAIN : undefined)
    });
  }
});

// Ping health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'MessMate Full-Stack API' });
});

// Mount Vite middleware for dev or serve production assets
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
    app.get('*', (req, res) => {
      res.sendFile('dist/index.html', { root: '.' });
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MessMate server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
