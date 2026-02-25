/**
 * Prompt Injection Detector
 * Identifies common prompt injection attack patterns
 */

const INJECTION_PATTERNS = [
  /ignore\s+(?:previous\s+)?instructions?/gi,
  /reveal\s+(?:your\s+)?system\s+prompt/gi,
  /show\s+(?:me\s+)?(?:your\s+)?(?:system\s+)?instructions/gi,
  /what\s+(?:are|is)\s+your\s+(?:system\s+)?prompt/gi,
  /developer\s+(?:message|instructions?|mode)/gi,
  /hidden\s+rules?/gi,
  /translate\s+(?:system\s+)?prompt/gi,
  /forget\s+(?:previous\s+)?instructions?/gi,
  /override\s+(?:previous\s+)?instructions?/gi,
  /disregard\s+(?:previous\s+)?instructions?/gi,
  /now\s+(?:pretend|act)\s+as/gi,
  /you\s+are\s+now/gi,
  /new\s+instructions?/gi,
  /jailbreak/gi,
  /bypass\s+security/gi,
  /admin\s+access/gi,
];

/**
 * Detect prompt injection attempts in content
 * @param {string} content - The content to analyze
 * @returns {Object} { isInjection: boolean, detectedPatterns: string[] }
 */
function detectInjection(content) {
  if (typeof content !== 'string') {
    return { isInjection: false, detectedPatterns: [] };
  }

  const detectedPatterns = [];

  for (const pattern of INJECTION_PATTERNS) {
    const matches = content.match(pattern);
    if (matches) {
      detectedPatterns.push(...matches);
    }
  }

  return {
    isInjection: detectedPatterns.length > 0,
    detectedPatterns: [...new Set(detectedPatterns.map(p => p.toLowerCase()))],
  };
}

module.exports = {
  detectInjection,
  INJECTION_PATTERNS,
};
