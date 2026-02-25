/**
 * Test OpenAI API Key
 * Run: node test-api-key.js
 */

require('dotenv').config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

async function testAPIKey() {
  console.log('\n🔍 Testing OpenAI API Key...\n');
  
  if (!OPENAI_API_KEY) {
    console.error('❌ OPENAI_API_KEY not found in .env file');
    process.exit(1);
  }

  console.log(`📍 API Key loaded: ${OPENAI_API_KEY.substring(0, 20)}...`);
  console.log(`🎯 API Endpoint: ${OPENAI_API_URL}\n`);
  
  try {
    console.log('🚀 Sending test request to OpenAI...');
    
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'user', content: 'Say "API key works!"' }
        ],
        max_tokens: 10,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✅ SUCCESS! API key is valid and working.\n');
      console.log('Response:', data.choices[0].message.content);
      console.log('\n✨ Your OpenAI account is ready to use!\n');
      process.exit(0);
    } else {
      console.error('❌ API Error:', response.status, data.error?.message);
      
      if (data.error?.code === 'insufficient_quota') {
        console.error('\n⚠️  Your account has exceeded quota. Solutions:');
        console.error('1. Add a payment method: https://platform.openai.com/account/billing/overview');
        console.error('2. Check your usage: https://platform.openai.com/account/billing/usage');
        console.error('3. Create a new API key: https://platform.openai.com/api-keys');
      } else if (data.error?.code === 'invalid_api_key') {
        console.error('\n⚠️  Invalid API key. Solutions:');
        console.error('1. Generate a new key: https://platform.openai.com/api-keys');
        console.error('2. Update backend/.env with the new key');
        console.error('3. Restart the backend server');
      } else if (data.error?.code === 'model_not_found') {
        console.error('\n⚠️  Model not found. Try using gpt-3.5-turbo or gpt-4');
      }
      
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Network Error:', error.message);
    console.error('\n⚠️  Could not connect to OpenAI. Check:');
    console.error('1. Internet connection');
    console.error('2. Firewall/VPN settings');
    console.error('3. OpenAI service status: https://status.openai.com');
    process.exit(1);
  }
}

testAPIKey();
