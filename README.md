# Prompt Injection Analysis Lab

**Advanced Prompt Injection Analysis Lab: A full-stack laboratory for researching and defending against LLM security threats. Compare vulnerable and hardened prompts in real-time.**

---

## 🚀 Features

- **Dual-Mode Analysis**: Toggle between `WEAK` and `DEFEND` modes to see how prompt hardening impacts model behavior.
- **Real-Time Detection**: Automated scanning for known prompt injection patterns and technical risk flagging.
- **System Transparency**: Live view of active system instructions and security protocols.
- **Confidence Gauge**: Visual indicators of model threat levels based on document content.

## 🛠️ Setup & Installation

### Prerequisites
- Node.js (v18+)
- OpenRouter API Key (for LLM analysis)

### Backend
1. `cd backend`
2. `npm install`
3. Create a `.env` file with `OPENROUTER_API_KEY=your_key_here`
4. `npm start`

### Frontend
1. `cd frontend`
2. `npm install`
3. `npm run dev`

## 📖 How to Use

1. **Upload Asset**: Drag and drop or select a `.txt` or `.pdf` file for analysis.
2. **Execute Reconnaissance**: Send queries to the LLM to test its security boundaries.
3. **Switch Modes**: Use the security toggle to apply `DEFEND` protocols and verify protection.
4. **Inspect Results**: Use the "EXPLAIN WHY" feature to understand technical risk assessments.
