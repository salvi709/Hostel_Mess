export type ValidationDecision = 'RELEVANT' | 'IRRELEVANT' | 'UNCERTAIN';

export interface ReviewValidationResult {
  decision: ValidationDecision;
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
  userMessage?: string;
}

// User-facing error message constants required by the prompt
export const MSG_IRRELEVANT = "Please write something related to today's meal or your mess experience.";
export const MSG_UNCERTAIN = "Please provide a little more detail about your meal experience.";

// Common greetings and non-dining casual phrases
const GREETINGS_AND_CASUAL = [
  'hi', 'hello', 'hey', 'heyy', 'hii', 'hiii', 'yo', 'sup', 'hola',
  'good morning', 'good afternoon', 'good evening', 'good night', 'gm', 'gn',
  'hello bro', 'hey bro', 'bro', 'dude', 'yaar', 'bhai', 'brother',
  'how are you', 'how are u', 'how r u', 'hru', "what's up", 'whats up', 'wassup',
  'nice day', 'good day', 'have a nice day',
  'call me', 'call back', 'text me', 'whatsapp me',
  'who are you', 'who r u', 'what is this', 'test', 'testing', 'check', 'sample',
  'bye', 'see you', 'cya', 'ok', 'okay', 'k', 'kk', 'yes', 'no', 'yeah', 'yep', 'nope',
  'lol', 'lmao', 'rofl', 'hahaha', 'haha', 'hehe',
  'buy iphone', 'iphone', 'phone', 'purchase a phone', 'football', 'cricket', 'game'
];

// Rich vocabulary for mess, food, dishes, dining qualities, taste, hygiene, service
const DINING_TERMS = [
  // Food & Dishes
  'food', 'meal', 'khana', 'lunch', 'dinner', 'breakfast', 'snack', 'snacks', 'dish', 'dishes',
  'dal', 'daal', 'roti', 'chapati', 'phulka', 'paratha', 'naan', 'puri', 'poori',
  'rice', 'chawal', 'fried rice', 'biryani', 'pulao', 'khichdi', 'curry', 'sabzi', 'bhaji',
  'paneer', 'chicken', 'egg', 'soya', 'kofta', 'rajma', 'chole', 'sambar', 'rasam',
  'idli', 'dosa', 'vada', 'upma', 'poha', 'sheera', 'halwa', 'sweet', 'gulab jamun', 'kheer',
  'chutney', 'salad', 'curd', 'dahi', 'raita', 'papad', 'pickle', 'achar',
  'tea', 'chai', 'coffee', 'milk', 'juice', 'soup', 'water',

  // Taste & Cooking
  'taste', 'tasty', 'delicious', 'yummy', 'flavor', 'flavour', 'spicy', 'salty', 'namak',
  'sweet', 'sour', 'bitter', 'bland', 'oily', 'greasy', 'boiled', 'fried', 'cooked',
  'undercooked', 'overcooked', 'raw', 'kaccha', 'burnt', 'crispy', 'soft', 'hard', 'stiff',
  'chewy', 'rubbery', 'watery', 'thick', 'dry', 'soggy',

  // Quality & Temperature
  'quality', 'fresh', 'freshness', 'stale', 'basi', 'cold', 'thanda', 'hot', 'garam',
  'warm', 'lukewarm', 'smell', 'bad smell', 'stink', 'spoiled', 'rotten',

  // Portion & Quantity
  'quantity', 'portion', 'amount', 'serving', 'less', 'more', 'kam', 'jyada',
  'insufficient', 'sufficient', 'enough', 'not enough', 'small portion', 'extra',

  // Hygiene & Mess Environment
  'hygiene', 'clean', 'cleanliness', 'dirty', 'messy', 'hair', 'insect', 'fly', 'cockroach',
  'worm', 'stone', 'kankar', 'dust', 'plate', 'plates', 'spoon', 'glass', 'table', 'tables',
  'floor', 'washbasin', 'sink', 'handwash', 'sanitary', 'unhygienic',

  // Service, Staff & Dining Experience
  'service', 'staff', 'cook', 'chef', 'server', 'worker', 'counter', 'queue', 'line',
  'timing', 'late', 'early', 'crowd', 'crowded', 'mess', 'dining', 'canteen', 'hostel mess',
  'experience', 'management', 'behavior', 'rude', 'polite', 'slow', 'fast'
];

// General dining sentiment keywords when combined with dining context
const SENTIMENT_TERMS = [
  'good', 'bad', 'terrible', 'horrible', 'worst', 'best', 'poor', 'great', 'awesome',
  'superb', 'bakwaas', 'pathetic', 'disgusting', 'waste', 'disappointing', 'satisfying'
];

/**
 * Deterministic semantic analysis of food and mess feedback.
 * Used directly as fallback or fast verification.
 */
export function validateReviewText(rawText: string): ReviewValidationResult {
  const text = (rawText || '').trim();

  // If empty string, review is empty (which is allowed for star-only rating)
  if (!text) {
    return {
      decision: 'RELEVANT',
      confidence: 1.0,
      category: 'MEAL_EXPERIENCE',
      reason: 'Empty written review (rating-only submission allowed).'
    };
  }

  const lower = text.toLowerCase();
  const cleaned = lower.replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim();

  // 1. Check for pure numbers, symbols, or keyboard mashing
  if (/^[^a-zA-Z]+$/.test(cleaned) || !/[a-zA-Z]/.test(cleaned)) {
    return {
      decision: 'IRRELEVANT',
      confidence: 0.99,
      category: 'SPAM',
      reason: 'Text contains no readable words or is purely numbers/symbols.',
      userMessage: MSG_IRRELEVANT
    };
  }

  // 2. Repetitive characters / gibberish (e.g. "asdfghjkl", "qwertyuiop", "aaaaaa", "123456789")
  if (/(.)\1{3,}/.test(lower) || /^[asdfghjklqwertyuiopzxcvbnm]{6,}$/i.test(cleaned)) {
    const isCommonEnglish = ['little', 'butter', 'coffee', 'toooo'].some(w => lower.includes(w));
    if (!isCommonEnglish && /(.)\1{3,}/.test(lower)) {
      return {
        decision: 'IRRELEVANT',
        confidence: 0.98,
        category: 'SPAM',
        reason: 'Review contains repetitive meaningless characters.',
        userMessage: MSG_IRRELEVANT
      };
    }
  }

  // Check keyboard mash sequence
  const mashSequences = ['asdfghjkl', 'qwerty', 'zxcvbnm', '123456789', '123456'];
  if (mashSequences.some(seq => lower.includes(seq))) {
    return {
      decision: 'IRRELEVANT',
      confidence: 0.99,
      category: 'SPAM',
      reason: 'Review contains keyboard mashing pattern.',
      userMessage: MSG_IRRELEVANT
    };
  }

  // 3. Exact or prefix match against conversational greetings and casual chatter
  const isGreetingMatch = GREETINGS_AND_CASUAL.some(greeting => {
    return cleaned === greeting || 
           cleaned.startsWith(greeting + ' ') || 
           cleaned.endsWith(' ' + greeting);
  });

  if (isGreetingMatch) {
    // Check if it also explicitly mentions a food/dining term (e.g. "Hi, the food was good")
    const hasFoodTerm = DINING_TERMS.some(term => {
      const regex = new RegExp(`\\b${term}\\b`, 'i');
      return regex.test(lower);
    });

    if (!hasFoodTerm) {
      return {
        decision: 'IRRELEVANT',
        confidence: 0.98,
        category: 'UNRELATED',
        reason: 'Review is a greeting or casual chat without any mention of food or mess dining.',
        userMessage: MSG_IRRELEVANT
      };
    }
  }

  // 4. Extremely short texts (<= 3 chars, e.g. "hi", "ok", "yo", "no", "gm")
  if (cleaned.length <= 3 && !['tea', 'egg', 'oil', 'dal'].includes(cleaned)) {
    return {
      decision: 'IRRELEVANT',
      confidence: 0.99,
      category: 'UNRELATED',
      reason: 'Text is too brief to contain dining feedback.',
      userMessage: MSG_IRRELEVANT
    };
  }

  // 5. Look for dining domain terms
  const matchedDiningTerms = DINING_TERMS.filter(term => {
    const regex = new RegExp(`\\b${term}\\b`, 'i');
    return regex.test(lower);
  });

  const matchedSentimentTerms = SENTIMENT_TERMS.filter(term => {
    const regex = new RegExp(`\\b${term}\\b`, 'i');
    return regex.test(lower);
  });

  // Category determination
  const hasTaste = ['taste', 'tasty', 'salty', 'namak', 'spicy', 'sweet', 'sour', 'bland', 'flavor', 'flavour', 'oily'].some(t => lower.includes(t));
  const hasHygiene = ['hygiene', 'clean', 'dirty', 'hair', 'insect', 'fly', 'cockroach', 'plate', 'table', 'dust', 'washbasin'].some(t => lower.includes(t));
  const hasQuantity = ['quantity', 'portion', 'amount', 'serving', 'kam', 'jyada', 'insufficient', 'enough'].some(t => lower.includes(t));
  const hasService = ['service', 'staff', 'cook', 'chef', 'queue', 'counter', 'timing', 'rude', 'late'].some(t => lower.includes(t));
  const hasQuality = ['quality', 'fresh', 'freshness', 'stale', 'cold', 'hot', 'warm', 'thanda', 'garam', 'undercooked', 'burnt', 'raw'].some(t => lower.includes(t));

  let assignedCategory: ReviewValidationResult['category'] = 'MEAL_EXPERIENCE';
  if (hasTaste) assignedCategory = 'TASTE';
  else if (hasHygiene) assignedCategory = 'HYGIENE';
  else if (hasQuantity) assignedCategory = 'QUANTITY';
  else if (hasService) assignedCategory = 'SERVICE';
  else if (hasQuality) assignedCategory = 'FOOD_QUALITY';

  // If dining terms are matched:
  if (matchedDiningTerms.length > 0) {
    return {
      decision: 'RELEVANT',
      confidence: 0.95,
      category: assignedCategory,
      reason: `Review directly mentions dining elements (${matchedDiningTerms.slice(0, 2).join(', ')}).`
    };
  }

  // If short sentiment phrase with dining context (e.g. "Too salty", "Undercooked", "Very spicy", "Disgusting today")
  if (hasTaste || hasHygiene || hasQuantity || hasQuality || hasService) {
    return {
      decision: 'RELEVANT',
      confidence: 0.92,
      category: assignedCategory,
      reason: 'Review directly describes food quality, hygiene, or taste characteristics.'
    };
  }

  // Sentiment only without food word (e.g. "Today was very good", "Awesome!", "Terrible experience")
  if (matchedSentimentTerms.length > 0) {
    if (lower.includes('today') || lower.includes('meal') || lower.includes('lunch') || lower.includes('dinner') || lower.includes('breakfast')) {
      return {
        decision: 'RELEVANT',
        confidence: 0.88,
        category: 'MEAL_EXPERIENCE',
        reason: 'Review expresses dining sentiment for today\'s meal.'
      };
    }

    // If it's just "Good" or "Bad" with no context at all
    if (cleaned.split(' ').length <= 2) {
      return {
        decision: 'UNCERTAIN',
        confidence: 0.60,
        category: 'OTHER_RELEVANT',
        reason: 'Feedback is very brief. Needs dining context.',
        userMessage: MSG_UNCERTAIN
      };
    }
  }

  // 6. If words are random or have zero dining connection
  // Examples: "Nice day", "Where are you going", "Call my phone"
  if (cleaned.length < 15) {
    return {
      decision: 'UNCERTAIN',
      confidence: 0.55,
      category: 'OTHER_RELEVANT',
      reason: 'Review is too short and lacks clear food or mess dining context.',
      userMessage: MSG_UNCERTAIN
    };
  }

  // Long text with zero dining relevance
  return {
    decision: 'IRRELEVANT',
    confidence: 0.90,
    category: 'UNRELATED',
    reason: 'Review does not contain references to the meal, food, hygiene, or dining experience.',
    userMessage: MSG_IRRELEVANT
  };
}
