
/**
 * Validate JSON response from LLM
 * @param {string} responseText 
 * @returns {Object}
 */
function validateResponse(responseText) {
  try {
    // Try to parse as JSON
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      // Try to extract JSON from markdown code blocks
      const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        data = JSON.parse(jsonMatch[1]);
      } else {
        // Try to find JSON object in the response
        const objectMatch = responseText.match(/\{[\s\S]*\}/);
        if (objectMatch) {
          data = JSON.parse(objectMatch[0]);
        } else {
          return {
            valid: false,
            data: null,
            error: 'Invalid JSON response: no JSON object found',
          };
        }
      }
    }

    // Validate structure
    if (typeof data !== 'object' || data === null) {
      return {
        valid: false,
        data: null,
        error: 'Invalid JSON response: root is not an object',
      };
    }

    if (typeof data.response !== 'string') {
      return {
        valid: false,
        data: null,
        error: 'Invalid JSON response: "response" field must be string',
      };
    }

    if (!Array.isArray(data.risk_flags)) {
      return {
        valid: false,
        data: null,
        error: 'Invalid JSON response: "risk_flags" field must be array',
      };
    }

    // Validate risk_flags are strings
    if (!data.risk_flags.every(flag => typeof flag === 'string')) {
      return {
        valid: false,
        data: null,
        error: 'Invalid JSON response: all risk_flags must be strings',
      };
    }

    return {
      valid: true,
      data: {
        response: data.response,
        risk_flags: data.risk_flags,
      },
      error: null,
    };
  } catch (error) {
    return {
      valid: false,
      data: null,
      error: `JSON validation error: ${error.message}`,
    };
  }
}

module.exports = {
  validateResponse,
};
