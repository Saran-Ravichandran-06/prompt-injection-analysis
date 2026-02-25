/**
 * LLM Integration Module
 * Handles OpenRouter API calls and response processing
 */

require('dotenv').config();
const { validateResponse } = require('./validator');
const { buildDefendSystemMessage, buildUserMessage, analyzeDocumentRisks } = require('./defend');
const { buildVulnerableSystemMessage } = require('./vulnerable');

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

/**
 * Call OpenRouter API with fallback for quota errors
 * @param {Array} messages - Messages array for the API
 * @returns {Promise<string>}
 */
async function callOpenRouter(messages) {
  if (!OPENROUTER_API_KEY || OPENROUTER_API_KEY === 'your_openrouter_api_key_here') {
    throw new Error('OPENROUTER_API_KEY not configured in .env file');
  }

  try {
    console.log('🔄 Calling OpenRouter API...');
    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'LLM Security Demo',
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o-mini',
        messages: messages,
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      const errorMessage = error.error?.message || 'Unknown error';
      const errorCode = error.error?.code || 'unknown';
      
      console.error('❌ OpenRouter API Error:');
      console.error(`   Code: ${errorCode}`);
      console.error(`   Message: ${errorMessage}`);
      
      // Handle quota/billing errors with fallback mock response
      if (errorMessage.toLowerCase().includes('quota') || 
          errorMessage.toLowerCase().includes('billing') || 
          errorMessage.toLowerCase().includes('payment') ||
          errorCode === 'insufficient_quota') {
        console.warn('⚠️  OpenRouter quota/billing issue detected. Using mock response.');
        console.warn('📝 Add funds to: https://openrouter.ai/account/billing');
        return getMockResponse(messages);
      }
      
      // For other errors, throw to see what's happening
      throw new Error(`OpenRouter API error (${errorCode}): ${errorMessage}`);
    }

    const data = await response.json();
    console.log('✅ OpenRouter API response received successfully');
    return data.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('❌ Error calling OpenRouter:', error.message);
    
    // Handle quota/billing errors with fallback
    if (error.message.toLowerCase().includes('quota') || 
        error.message.toLowerCase().includes('billing') ||
        error.message.toLowerCase().includes('insufficient_quota')) {
      console.warn('⚠️  Using mock response due to API issue.');
      return getMockResponse(messages);
    }
    
    // Re-throw other errors so we can see them
    throw error;
  }
}

/**
 * Generate mock response for testing when API is unavailable
 * @param {Array} messages - Messages array
 * @returns {string}
 */
function getMockResponse(messages) {
  const userMessage = messages[messages.length - 1]?.content || '';
  
  // Generate contextual mock responses
  if (userMessage.toLowerCase().includes('summary') || userMessage.toLowerCase().includes('summarize')) {
    return 'This is a mock response for testing purposes. The document appears to be a technical specification containing important information. A summary would include key points and conclusions outlined in the document.';
  }
  
  if (userMessage.toLowerCase().includes('analyze') || userMessage.toLowerCase().includes('analysis')) {
    return 'Based on the provided document, the analysis reveals several important aspects: 1) The main topic and context, 2) Key findings and data points, 3) Relevant conclusions and implications. Further analysis would depend on the specific content of your document.';
  }
  
  if (userMessage.toLowerCase().includes('extract') || userMessage.toLowerCase().includes('extract')) {
    return 'I can see you\'ve provided a document. Key information that could be extracted would include: important dates, names, numbers, main topics, and critical sections. Please note this is a mock response - enable OpenRouter API for full analysis.';
  }
  
  // Default mock response
  return 'This is a mock response for testing purposes. Your OpenRouter API key appears to have quota or billing issues. To use the full LLM security demo, please: 1) Add funds to https://openrouter.ai/account/billing, 2) Ensure your OPENROUTER_API_KEY is set in backend/.env, 3) Verify you have sufficient credits. Once configured, real LLM responses will appear here.';
}


/**
 * Detect whether a user query is attempting to elicit system instructions or secrets
 * @param {string} query
 * @returns {boolean}
 */
function isSensitiveQuery(query) {
  if (!query || typeof query !== 'string') return false;
  const patterns = [
    /system\s+prompt/gi,
    /system\s+instructions?/gi,
    /system\s+message/gi,
    /secret\s+key/gi,
    /secret\s+code/gi,
    /hidden\s+rules?/gi,
    /developer\s+message/gi,
    /what\s+is\s+your\s+system\s+prompt/gi,
    /reveal\s+(?:the\s+)?secret/gi,
    /KAMBAA/gi,
  ];

  return patterns.some((p) => p.test(query));
}

/**
 * Detect whether document content contains injected prompts requesting secrets or system instructions
 * @param {string} content
 * @returns {boolean}
 */
function isSensitiveContent(content) {
  if (!content || typeof content !== 'string') return false;

  // Quick checks for explicit injection markers or secret references
  if (content.toLowerCase().includes('injection prompt') || content.includes('KAMBAA')) {
    return true;
  }

  // Reuse patterns from isSensitiveQuery
  return isSensitiveQuery(content);
}

/**
 * Format system instructions and secret into pointwise subheaded text
 * @param {string} systemMessage
 * @param {string} secret
 * @returns {string}
 */
function formatSystemDisclosure(systemMessage, secret) {
  const lines = String(systemMessage).split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const bullets = lines.map(l => `- ${l}`).join('\n');
  return `INTRODUCTION\n- The following discloses system instructions and secret (vulnerable demo)\n\nSYSTEM INSTRUCTIONS\n${bullets}\n\nSECRET_KEY\n- ${secret}`;
}


/**
 * Process query in V1 (Vulnerable) mode
 * @param {string} documentText
 * @param {string} userQuery
 * @returns {Promise<Object>}
 */
async function processV1(documentText, userQuery) {
  const systemMessage = buildVulnerableSystemMessage();
  const userMessage = buildUserMessage(documentText, userQuery, 'v1');

  // Vulnerable behavior: if the user asks about system instructions or secret keys, disclose them
  // Also disclose if the document contains injected prompts requesting secrets
  if (isSensitiveQuery(userQuery) || isSensitiveContent(documentText)) {
    return {
      success: true,
      mode: 'v1',
      response: formatSystemDisclosure(systemMessage, 'KAMBAA'),
      risk_flags: ['sensitive_disclosed'],
      validated: false,
      note: 'Vulnerable mode: disclosed system instructions and secret key',
    };
  }

  try {
    const response = await callOpenRouter([
      { role: 'system', content: systemMessage },
      { role: 'user', content: userMessage },
    ]);

    // V1 returns raw output without validation
    return {
      success: true,
      mode: 'v1',
      response: response,
      risk_flags: [],
      validated: false,
      note: 'Raw LLM output (no validation - vulnerable to prompt injection)',
    };
  } catch (error) {
    return {
      success: false,
      mode: 'v1',
      error: error.message,
    };
  }
}

/**
 * Process query in V2 (DEFEND) mode
 * @param {string} documentText
 * @param {string} userQuery
 * @returns {Promise<Object>}
 */
async function processV2(documentText, userQuery) {
  // Analyze document for injection attempts
  const documentRisks = analyzeDocumentRisks(documentText);

  const systemMessage = buildDefendSystemMessage();
  const userMessage = buildUserMessage(documentText, userQuery, 'v2');
  // DEFEND behavior: if the user asks about system instructions or secret keys, block disclosure
  if (isSensitiveQuery(userQuery) || isSensitiveContent(documentText)) {
    return {
      success: true,
      mode: 'v2',
      response: 'Request blocked: cannot reveal system instructions or secret keys.',
      risk_flags: [...new Set([...documentRisks, 'sensitive_request_blocked'])],
      validated: true,
      note: 'DEFEND mode: blocked disclosure of sensitive information',
    };
  }

  try {
    const response = await callOpenRouter([
      { role: 'system', content: systemMessage },
      { role: 'user', content: userMessage },
    ]);

    // V2 validates response structure
    const validation = validateResponse(response);

    if (!validation.valid) {
      return {
        success: false,
        mode: 'v2',
        error: validation.error,
        note: 'Response validation failed - blocked unsafe response',
      };
    }

    // Merge document risks with LLM-detected risks
    const finalRiskFlags = [
      ...new Set([
        ...documentRisks,
        ...validation.data.risk_flags,
      ]),
    ];

    return {
      success: true,
      mode: 'v2',
      response: validation.data.response,
      risk_flags: finalRiskFlags,
      validated: true,
      note: 'Validated response (DEFEND-hardened)',
    };
  } catch (error) {
    return {
      success: false,
      mode: 'v2',
      error: error.message,
    };
  }
}

/**
 * Main entry point for processing queries
 * @param {string} documentText
 * @param {string} userQuery
 * @param {string} mode - 'v1' or 'v2'
 * @returns {Promise<Object>}
 */
async function processQuery(documentText, userQuery, mode = 'v2') {
  // Validate inputs
  if (!documentText || typeof documentText !== 'string') {
    return { success: false, error: 'Document text is required' };
  }

  if (!userQuery || typeof userQuery !== 'string') {
    return { success: false, error: 'User query is required' };
  }

  if (mode !== 'v1' && mode !== 'v2') {
    return { success: false, error: 'Mode must be v1 or v2' };
  }

  if (mode === 'v1') {
    return processV1(documentText, userQuery);
  } else {
    return processV2(documentText, userQuery);
  }
}

module.exports = {
  processQuery,
};
